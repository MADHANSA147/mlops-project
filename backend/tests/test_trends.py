"""
Tests for the trend analysis pipeline.
"""

import pytest
from scheduler.trend_scheduler import _calculate_trends, _extract_topics


class TestTrendCalculation:
    """Test growth and trend score calculations."""

    def test_growth_from_zero(self):
        """When previous frequency is 0, growth should use max(prev, 1) = 1."""
        topics = [
            {"topic": "Test Topic", "frequency": 100, "positive": 50, "negative": 30, "neutral": 20},
        ]
        result = _calculate_trends(topics)
        assert len(result) == 1
        # Growth from 0 → 100: ((100 - 0) / max(0, 1)) * 100 = 10000
        assert result[0]["growth"] == 10000.0

    def test_trend_score_range(self):
        """Trend scores should be between 0 and 1."""
        topics = [
            {"topic": "A", "frequency": 200, "positive": 50, "negative": 30, "neutral": 20},
            {"topic": "B", "frequency": 100, "positive": 40, "negative": 40, "neutral": 20},
            {"topic": "C", "frequency": 50, "positive": 60, "negative": 20, "neutral": 20},
        ]
        result = _calculate_trends(topics)
        for t in result:
            assert 0 <= t["trend_score"] <= 1.0

    def test_sorted_by_score(self):
        """Results should be sorted by trend_score descending."""
        topics = [
            {"topic": "Low", "frequency": 10, "positive": 50, "negative": 30, "neutral": 20},
            {"topic": "High", "frequency": 1000, "positive": 50, "negative": 30, "neutral": 20},
            {"topic": "Mid", "frequency": 500, "positive": 50, "negative": 30, "neutral": 20},
        ]
        result = _calculate_trends(topics)
        scores = [t["trend_score"] for t in result]
        assert scores == sorted(scores, reverse=True)

    def test_empty_input(self):
        assert _calculate_trends([]) == []


class TestTopicExtraction:
    """Test TF-IDF based topic extraction."""

    def test_extract_from_posts(self):
        posts = [
            {"title": "AI regulation passes Congress", "text": "New laws for artificial intelligence"},
            {"title": "AI regulation debate heats up", "text": "Lawmakers discuss AI regulation"},
            {"title": "Tech companies respond to AI regulation", "text": "Silicon Valley reacts"},
        ]
        topics = _extract_topics(posts, top_n=5)
        assert len(topics) > 0
        # Each topic should have required fields
        for t in topics:
            assert "topic" in t
            assert "frequency" in t
            assert "positive" in t
            assert "negative" in t
            assert "neutral" in t

    def test_empty_posts(self):
        assert _extract_topics([]) == []
