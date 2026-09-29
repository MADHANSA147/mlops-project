"""
APScheduler job for near real-time Reddit trend analysis.

Workflow (runs every N minutes):
  1. Fetch latest Reddit posts via PRAW
  2. Store raw posts in MongoDB
  3. NLTK preprocessing
  4. TF-IDF keyword extraction
  5. Frequency & growth calculation
  6. Trend score: 0.7 * norm_freq + 0.3 * norm_growth
  7. VADER sentiment per topic
  8. Update trending_topics collection
  9. Broadcast update via WebSocket
"""

import asyncio
from datetime import datetime, timezone
from collections import Counter

import praw
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import get_settings
from ml.preprocessor import preprocess_text
from utils.logger import logger

settings = get_settings()

# ── Module state ─────────────────────────────────────────────────
_scheduler: AsyncIOScheduler | None = None
_previous_frequencies: dict[str, int] = {}
_vader = SentimentIntensityAnalyzer()


def _fetch_reddit_posts() -> list[dict]:
    """Fetch recent posts from configured subreddits using PRAW (sync)."""
    if not settings.reddit_client_id or not settings.reddit_client_secret:
        logger.warning("Reddit API credentials not configured – skipping fetch")
        return []

    try:
        reddit = praw.Reddit(
            client_id=settings.reddit_client_id,
            client_secret=settings.reddit_client_secret,
            user_agent=settings.reddit_user_agent,
        )

        posts = []
        for sub_name in settings.subreddit_list:
            try:
                subreddit = reddit.subreddit(sub_name)
                for post in subreddit.hot(limit=25):
                    posts.append({
                        "post_id": post.id,
                        "subreddit": sub_name,
                        "title": post.title,
                        "text": post.selftext[:1000] if post.selftext else "",
                        "author": str(post.author) if post.author else "[deleted]",
                        "score": post.score,
                        "num_comments": post.num_comments,
                        "url": post.url,
                        "created_utc": datetime.fromtimestamp(post.created_utc, tz=timezone.utc),
                        "platform": "Reddit",
                    })
            except Exception as exc:
                logger.warning("Failed to fetch from r/%s: %s", sub_name, exc)

        logger.info("Fetched %d Reddit posts from %d subreddits", len(posts), len(settings.subreddit_list))
        return posts

    except Exception as exc:
        logger.error("Reddit API error: %s", exc)
        return []


def _extract_topics(posts: list[dict], top_n: int = 10) -> list[dict]:
    """Extract trending topics using TF-IDF keyword extraction."""
    if not posts:
        return []

    # Preprocess all post texts
    texts = [preprocess_text(f"{p['title']} {p['text']}") for p in posts]
    texts = [t for t in texts if t.strip()]

    if not texts:
        return []

    # TF-IDF to find important terms
    vectorizer = TfidfVectorizer(max_features=100, ngram_range=(1, 2), stop_words="english")
    try:
        tfidf_matrix = vectorizer.fit_transform(texts)
    except ValueError:
        return []

    feature_names = vectorizer.get_feature_names_out()

    # Sum TF-IDF scores across all documents for each term
    scores = tfidf_matrix.sum(axis=0).A1
    term_scores = list(zip(feature_names, scores))
    term_scores.sort(key=lambda x: x[1], reverse=True)

    # Also count raw frequency
    all_text = " ".join(texts)
    word_freq = Counter(all_text.split())

    topics = []
    for term, tfidf_score in term_scores[:top_n]:
        freq = word_freq.get(term, 0)

        # Sentiment analysis on posts containing this term
        related_posts = [p for p in posts if term.lower() in f"{p['title']} {p['text']}".lower()]
        sentiments = {"positive": 0, "negative": 0, "neutral": 0}
        for rp in related_posts:
            vs = _vader.polarity_scores(f"{rp['title']} {rp['text']}")
            if vs["compound"] >= 0.05:
                sentiments["positive"] += 1
            elif vs["compound"] <= -0.05:
                sentiments["negative"] += 1
            else:
                sentiments["neutral"] += 1

        total_sent = sum(sentiments.values()) or 1
        topics.append({
            "topic": term.title(),
            "frequency": freq,
            "tfidf_score": round(tfidf_score, 4),
            "positive": round(sentiments["positive"] / total_sent * 100, 1),
            "negative": round(sentiments["negative"] / total_sent * 100, 1),
            "neutral": round(sentiments["neutral"] / total_sent * 100, 1),
            "related_post_count": len(related_posts),
            "keywords": [term],
        })

    return topics


def _calculate_trends(topics: list[dict]) -> list[dict]:
    """Calculate growth and trend scores for each topic."""
    global _previous_frequencies

    if not topics:
        return []

    # Get current frequencies
    current_freqs = {t["topic"]: t["frequency"] for t in topics}

    # Calculate growth
    for topic in topics:
        prev = _previous_frequencies.get(topic["topic"], 0)
        current = topic["frequency"]
        topic["growth"] = round(((current - prev) / max(prev, 1)) * 100, 1)

    # Normalize frequency and growth for scoring
    max_freq = max(t["frequency"] for t in topics) or 1
    max_growth = max(abs(t["growth"]) for t in topics) or 1

    for topic in topics:
        norm_freq = topic["frequency"] / max_freq
        norm_growth = abs(topic["growth"]) / max_growth
        topic["trend_score"] = round(0.7 * norm_freq + 0.3 * norm_growth, 4)

    # Sort by trend score
    topics.sort(key=lambda t: t["trend_score"], reverse=True)

    # Update previous frequencies for next window
    _previous_frequencies = current_freqs

    return topics


async def run_trend_pipeline() -> None:
    """Execute the full trend analysis pipeline."""
    logger.info("Starting trend analysis pipeline...")

    try:
        # 1. Fetch Reddit posts (sync call in executor)
        loop = asyncio.get_event_loop()
        posts = await loop.run_in_executor(None, _fetch_reddit_posts)

        if not posts:
            logger.info("No posts fetched – pipeline skipped")
            return

        # 2. Store raw posts
        from repositories import reddit_post_repo
        inserted = await reddit_post_repo.bulk_insert_posts(posts)
        logger.info("Stored %d new posts", inserted)

        # 3-7. Extract topics with sentiment
        topics = await loop.run_in_executor(None, _extract_topics, posts)

        # 8. Calculate trends
        topics = _calculate_trends(topics)

        # 9. Update MongoDB
        from repositories import trend_repo
        for i, topic in enumerate(topics):
            topic["id"] = f"trend-{i:03d}"
            topic["first_detected"] = topic.get("first_detected", datetime.now(timezone.utc).isoformat())
            topic["description"] = f"Trending topic '{topic['topic']}' with {topic['frequency']} mentions across Reddit."
            await trend_repo.upsert_trending_topic(topic)

        # Save trend window snapshot
        await trend_repo.save_trend_window({
            "topic_count": len(topics),
            "total_posts": len(posts),
            "top_topics": [t["topic"] for t in topics[:5]],
        })

        logger.info("Trend pipeline complete – %d topics updated", len(topics))

        # 10. Broadcast via WebSocket
        try:
            from websocket import manager
            await manager.broadcast({
                "event": "trend_update",
                "data": {
                    "topic_count": len(topics),
                    "total_posts": len(posts),
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                },
            })
        except Exception as ws_exc:
            logger.warning("WebSocket broadcast failed: %s", ws_exc)

    except Exception as exc:
        logger.error("Trend pipeline error: %s", exc, exc_info=True)


def start_scheduler() -> AsyncIOScheduler:
    """Create and start the APScheduler for periodic trend analysis."""
    global _scheduler

    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(
        run_trend_pipeline,
        "interval",
        minutes=settings.scheduler_interval_minutes,
        id="trend_pipeline",
        name="Reddit Trend Analysis Pipeline",
        replace_existing=True,
        max_instances=1,
    )
    _scheduler.start()
    logger.info(
        "Scheduler started – trend pipeline runs every %d minutes",
        settings.scheduler_interval_minutes,
    )
    return _scheduler


def stop_scheduler() -> None:
    """Shut down the scheduler gracefully."""
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        _scheduler = None
        logger.info("Scheduler stopped")
