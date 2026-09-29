"""
Trend analysis service – builds response data for the frontend.

Aggregates data from MongoDB or falls back to mock data when no
trend data has been collected yet.
"""

import math
import hashlib
from datetime import datetime, timezone
from repositories import trend_repo, reddit_post_repo
from models.trends import (
    TrendSummary, TrendItem, TrendDetail, TrendPost,
    RecentTrendRow, ChartData, TrendPageResponse,
)
from utils.logger import logger


# ── Stock images for trend cards ─────────────────────────────────
TREND_IMAGES = [
    "https://images.pexels.com/photos/5475750/pexels-photo-5475750.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/163064/pexels-photo-163064.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/905163/pexels-photo-905163.jpeg?auto=compress&cs=tinysrgb&w=800",
]


def _stable_image(topic: str) -> str:
    """Pick a deterministic image based on topic hash."""
    idx = int(hashlib.md5(topic.encode()).hexdigest(), 16) % len(TREND_IMAGES)
    return TREND_IMAGES[idx]


def _build_hourly(base: int) -> list[dict]:
    """Generate hourly trend chart data."""
    hours = ["00", "04", "08", "12", "16", "20"]
    return [
        {"hour": f"{h}:00", "posts": round(base * (0.4 + math.sin(i * 1.1) * 0.3 + i * 0.08))}
        for i, h in enumerate(hours)
    ]


def _build_daily(base: int) -> list[dict]:
    """Generate daily trend chart data."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return [
        {"day": d, "posts": round(base * (0.6 + math.cos(i * 0.9) * 0.25 + i * 0.04))}
        for i, d in enumerate(days)
    ]


def _time_ago(dt: datetime) -> str:
    """Convert a datetime to a human-readable 'X min ago' string."""
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    diff = (now - dt).total_seconds()
    if diff < 60:
        return "just now"
    if diff < 3600:
        return f"{int(diff // 60)} min ago"
    if diff < 86400:
        return f"{int(diff // 3600)} hr ago"
    return f"{int(diff // 86400)} days ago"


async def get_trend_page_data() -> TrendPageResponse:
    """Build the full data payload for the Trend Analysis page."""
    topics = await trend_repo.get_all_trends()
    total_posts = await reddit_post_repo.count_posts()
    trend_count = len(topics)

    # If no trend data collected yet, return defaults
    if not topics:
        return _mock_trend_page()

    # ── Summary ──────────────────────────────────────────────────
    summary = TrendSummary(
        totalPosts=total_posts,
        trendingTopics=trend_count,
        trendingHashtags=trend_count * 3,  # approximate
        platformsMonitored=1,  # Reddit only for now
    )

    # ── Trend Items ──────────────────────────────────────────────
    items = []
    for i, t in enumerate(topics[:6]):
        item = TrendItem(
            id=t.get("id", f"trend-{i:03d}"),
            topic=t["topic"],
            hashtag=f"#{t['topic'].replace(' ', '')}",
            description=t.get("description", f"Trending topic from Reddit with {t.get('frequency', 0)} mentions."),
            image=_stable_image(t["topic"]),
            posts=t.get("frequency", 0),
            platform="Reddit",
            sentimentPositive=round(t.get("positive", 33), 1),
            sentimentNegative=round(t.get("negative", 33), 1),
            sentimentNeutral=round(t.get("neutral", 34), 1),
            firstDetected=t.get("first_detected", datetime.now(timezone.utc).isoformat()),
            growth=round(t.get("growth", 0), 1),
        )
        items.append(item)

    # ── Recent rows ──────────────────────────────────────────────
    recent_rows = []
    for t in topics[:8]:
        recent_rows.append(RecentTrendRow(
            platform="Reddit",
            topic=f"#{t['topic'].replace(' ', '')}",
            time=_time_ago(t.get("last_updated", datetime.now(timezone.utc))),
        ))

    # ── Charts ───────────────────────────────────────────────────
    charts = ChartData(
        topicsLine=_build_topics_line(topics[:3]),
        hashtagsBar=[
            {"hashtag": f"#{t['topic'].replace(' ', '')}", "count": t.get("frequency", 0)}
            for t in topics[:6]
        ],
        platformDistribution=[
            {"name": "Reddit", "value": 100, "color": "#F59E0B"},
        ],
        dailyActivity=_build_daily(total_posts // 7 if total_posts > 0 else 1000),
    )

    return TrendPageResponse(summary=summary, items=items, recentRows=recent_rows, charts=charts)


def _build_topics_line(topics: list[dict]) -> list[dict]:
    """Build line chart data for top topics over the week."""
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    result = []
    for i, day in enumerate(days):
        row: dict = {"time": day}
        for t in topics:
            base = t.get("frequency", 100)
            row[t["topic"][:20]] = round(base * (0.5 + math.sin(i * 0.8) * 0.3 + i * 0.05))
        result.append(row)
    return result


async def get_trend_detail(topic_id: str) -> TrendDetail:
    """Build the detail page data for a single trend."""
    topic = await trend_repo.get_trend_by_id(topic_id)

    if not topic:
        return _mock_trend_detail(topic_id)

    total = topic.get("frequency", 0)
    posts_data = []
    platforms = ["Reddit"]
    sentiments = ["positive", "negative", "neutral"]

    # Get related posts from Reddit
    recent = await reddit_post_repo.get_recent_posts(limit=8)
    for i, p in enumerate(recent):
        posts_data.append(TrendPost(
            id=f"{topic_id}-post-{i}",
            platform="Reddit",
            author=p.get("author", f"@user_{1000 + i}"),
            content=p.get("title", p.get("text", ""))[:200],
            sentiment=sentiments[i % 3],
            timestamp=p.get("created_utc", datetime.now(timezone.utc)).isoformat()
            if isinstance(p.get("created_utc"), datetime)
            else str(p.get("created_utc", datetime.now(timezone.utc).isoformat())),
            engagement=max(0, p.get("score", 100)),
        ))

    # Fill remaining posts if needed
    while len(posts_data) < 8:
        i = len(posts_data)
        posts_data.append(TrendPost(
            id=f"{topic_id}-post-{i}",
            platform="Reddit",
            author=f"@user_{1000 + i * 37}",
            content=f"Discussion about {topic['topic']} continues to gain traction.",
            sentiment=sentiments[i % 3],
            timestamp=datetime.now(timezone.utc).isoformat(),
            engagement=1200 - i * 95,
        ))

    keywords = topic.get("keywords", [topic["topic"]])
    if len(keywords) < 5:
        keywords.extend(["trending", "analysis", "discussion", "update", "breaking"])
    keywords = keywords[:8]

    return TrendDetail(
        id=topic.get("id", topic_id),
        topic=topic["topic"],
        totalPosts=total,
        mostActivePlatform="Reddit",
        firstDetected=topic.get("first_detected", datetime.now(timezone.utc).isoformat()),
        description=topic.get("description", f"Trending topic with {total} posts."),
        sentiment={
            "positive": round(topic.get("positive", 33), 1),
            "negative": round(topic.get("negative", 33), 1),
            "neutral": round(topic.get("neutral", 34), 1),
        },
        hourlyTrend=_build_hourly(total // 6 if total > 0 else 100),
        dailyTrend=_build_daily(total // 7 if total > 0 else 100),
        keywords=keywords,
        posts=posts_data,
    )


# ── Mock fallback (used when DB is empty) ────────────────────────

def _mock_trend_page() -> TrendPageResponse:
    """Return mock data identical to the frontend's mockData.ts for first-time usage."""
    mock_items = [
        {"id": "trend-001", "topic": "AI Regulation Bill Passes Senate", "hashtag": "#AIRegulation",
         "desc": "Landmark legislation establishing guardrails for artificial intelligence development clears a key procedural vote.",
         "posts": 184320, "platform": "Twitter", "sp": 52, "sn": 31, "sne": 17, "growth": 34,
         "first": "2026-07-19T08:12:00Z"},
        {"id": "trend-002", "topic": "Global Climate Summit Reaches Accord", "hashtag": "#ClimateAction",
         "desc": "Nations agree on a binding framework to phase down fossil fuel subsidies by 2030.",
         "posts": 142880, "platform": "Twitter", "sp": 61, "sn": 22, "sne": 17, "growth": 28,
         "first": "2026-07-18T14:30:00Z"},
        {"id": "trend-003", "topic": "Major Tech Layoffs Announced", "hashtag": "#TechLayoffs",
         "desc": "A leading software company confirms restructuring affecting 8% of its workforce.",
         "posts": 98740, "platform": "Reddit", "sp": 18, "sn": 64, "sne": 18, "growth": 47,
         "first": "2026-07-20T11:05:00Z"},
        {"id": "trend-004", "topic": "New Vaccine Shows 94% Efficacy", "hashtag": "#MedicalBreakthrough",
         "desc": "Phase III trial results for a next-generation vaccine exceed expectations.",
         "posts": 76210, "platform": "Facebook", "sp": 71, "sn": 14, "sne": 15, "growth": 19,
         "first": "2026-07-20T06:45:00Z"},
        {"id": "trend-005", "topic": "Cryptocurrency Market Volatility Spikes", "hashtag": "#CryptoCrash",
         "desc": "A sudden 12% overnight drop triggers liquidations across major exchanges.",
         "posts": 64530, "platform": "Twitter", "sp": 12, "sn": 73, "sne": 15, "growth": 58,
         "first": "2026-07-21T02:20:00Z"},
        {"id": "trend-006", "topic": "Space Mission Returns First Samples", "hashtag": "#SpaceExploration",
         "desc": "A robotic probe successfully delivers pristine asteroid material to Earth.",
         "posts": 51280, "platform": "YouTube", "sp": 83, "sn": 6, "sne": 11, "growth": 22,
         "first": "2026-07-17T19:00:00Z"},
    ]

    items = [
        TrendItem(
            id=m["id"], topic=m["topic"], hashtag=m["hashtag"], description=m["desc"],
            image=TREND_IMAGES[i % len(TREND_IMAGES)], posts=m["posts"],
            platform=m["platform"], sentimentPositive=m["sp"], sentimentNegative=m["sn"],
            sentimentNeutral=m["sne"], firstDetected=m["first"], growth=m["growth"],
        )
        for i, m in enumerate(mock_items)
    ]

    return TrendPageResponse(
        summary=TrendSummary(totalPosts=1284530, trendingTopics=42, trendingHashtags=187, platformsMonitored=6),
        items=items,
        recentRows=[
            RecentTrendRow(platform="Twitter", topic="#AIRegulation", time="2 min ago"),
            RecentTrendRow(platform="Reddit", topic="#TechLayoffs", time="8 min ago"),
            RecentTrendRow(platform="Facebook", topic="#MedicalBreakthrough", time="14 min ago"),
            RecentTrendRow(platform="Twitter", topic="#CryptoCrash", time="21 min ago"),
            RecentTrendRow(platform="YouTube", topic="#SpaceExploration", time="33 min ago"),
            RecentTrendRow(platform="Instagram", topic="#ClimateAction", time="47 min ago"),
            RecentTrendRow(platform="TikTok", topic="#ViralUpdate", time="1 hr ago"),
            RecentTrendRow(platform="Twitter", topic="#ElectionNews", time="1 hr ago"),
        ],
        charts=ChartData(
            topicsLine=[
                {"time": "Mon", "Twitter": 4200, "Reddit": 2100, "Facebook": 1800},
                {"time": "Tue", "Twitter": 5100, "Reddit": 2400, "Facebook": 1900},
                {"time": "Wed", "Twitter": 4800, "Reddit": 2800, "Facebook": 1700},
                {"time": "Thu", "Twitter": 6200, "Reddit": 3100, "Facebook": 2200},
                {"time": "Fri", "Twitter": 7400, "Reddit": 2900, "Facebook": 2400},
                {"time": "Sat", "Twitter": 6800, "Reddit": 2600, "Facebook": 2000},
                {"time": "Sun", "Twitter": 7900, "Reddit": 3300, "Facebook": 2300},
            ],
            hashtagsBar=[
                {"hashtag": "#AIRegulation", "count": 184320},
                {"hashtag": "#ClimateAction", "count": 142880},
                {"hashtag": "#TechLayoffs", "count": 98740},
                {"hashtag": "#MedicalBreakthrough", "count": 76210},
                {"hashtag": "#CryptoCrash", "count": 64530},
                {"hashtag": "#SpaceExploration", "count": 51280},
            ],
            platformDistribution=[
                {"name": "Twitter", "value": 38, "color": "#2563EB"},
                {"name": "Reddit", "value": 22, "color": "#F59E0B"},
                {"name": "Facebook", "value": 18, "color": "#10B981"},
                {"name": "Instagram", "value": 12, "color": "#EF4444"},
                {"name": "YouTube", "value": 6, "color": "#8B5CF6"},
                {"name": "TikTok", "value": 4, "color": "#06B6D4"},
            ],
            dailyActivity=[
                {"day": "Mon", "posts": 8200},
                {"day": "Tue", "posts": 9400},
                {"day": "Wed", "posts": 9100},
                {"day": "Thu", "posts": 11500},
                {"day": "Fri", "posts": 12700},
                {"day": "Sat", "posts": 11400},
                {"day": "Sun", "posts": 13200},
            ],
        ),
    )


def _mock_trend_detail(topic_id: str) -> TrendDetail:
    """Return a mock trend detail matching the frontend's getTrendDetail()."""
    mock_map = {
        "trend-001": ("AI Regulation Bill Passes Senate", 184320, "Twitter", "2026-07-19T08:12:00Z", 52, 31, 17),
        "trend-002": ("Global Climate Summit Reaches Accord", 142880, "Twitter", "2026-07-18T14:30:00Z", 61, 22, 17),
        "trend-003": ("Major Tech Layoffs Announced", 98740, "Reddit", "2026-07-20T11:05:00Z", 18, 64, 18),
        "trend-004": ("New Vaccine Shows 94% Efficacy", 76210, "Facebook", "2026-07-20T06:45:00Z", 71, 14, 15),
        "trend-005": ("Cryptocurrency Market Volatility Spikes", 64530, "Twitter", "2026-07-21T02:20:00Z", 12, 73, 15),
        "trend-006": ("Space Mission Returns First Samples", 51280, "YouTube", "2026-07-17T19:00:00Z", 83, 6, 11),
    }

    data = mock_map.get(topic_id, ("Unknown Topic", 1000, "Reddit", datetime.now(timezone.utc).isoformat(), 33, 33, 34))
    name, total, platform, first, sp, sn, sne = data

    platforms = ["Twitter", "Facebook", "Reddit", "Instagram", "YouTube", "TikTok"]
    sentiments = ["positive", "negative", "neutral"]

    return TrendDetail(
        id=topic_id,
        topic=name,
        totalPosts=total,
        mostActivePlatform=platform,
        firstDetected=first,
        description=f"Detailed analysis of '{name}' trending across social media platforms.",
        sentiment={"positive": sp, "negative": sn, "neutral": sne},
        hourlyTrend=_build_hourly(total // 6),
        dailyTrend=_build_daily(total // 7),
        keywords=[name.split()[0], "policy", "breaking", "analysis", "public", "reaction", "update", "debate"],
        posts=[
            TrendPost(
                id=f"{topic_id}-post-{i}",
                platform=platforms[i % len(platforms)],
                author=f"@user_{1000 + i * 37}",
                content=f"Strong opinions on {name.lower()}. The discussion is moving fast."
                if i % 2 == 0
                else f"Just saw the latest on this topic. This changes the conversation significantly.",
                sentiment=sentiments[i % 3],
                timestamp=f"2026-07-2{1 - (i % 3)}T{10 + i}:00:00Z",
                engagement=1200 - i * 95,
            )
            for i in range(8)
        ],
    )
