"""
Trend analysis Pydantic models.
Matches the frontend's TypeScript interfaces: TrendSummary, TrendItem, TrendDetail, TrendPost, RecentTrendRow.
"""

from pydantic import BaseModel


class TrendSummary(BaseModel):
    """Summary statistics shown in the trend analysis page header cards."""
    totalPosts: int
    trendingTopics: int
    trendingHashtags: int
    platformsMonitored: int


class TrendItem(BaseModel):
    """A single trending topic card.
    
    Matches the frontend TrendItem interface with image, sentiment, growth.
    """
    id: str
    topic: str
    hashtag: str
    description: str
    image: str
    posts: int
    platform: str
    sentimentPositive: float
    sentimentNegative: float
    sentimentNeutral: float
    firstDetected: str
    growth: float


class TrendPost(BaseModel):
    """A single post within a trend detail page."""
    id: str
    platform: str
    author: str
    content: str
    sentiment: str  # "positive" | "negative" | "neutral"
    timestamp: str
    engagement: int


class TrendDetail(BaseModel):
    """Full detail page for a single trend.
    
    Includes sentiment breakdown, hourly/daily chart data, keywords, and posts.
    """
    id: str
    topic: str
    totalPosts: int
    mostActivePlatform: str
    firstDetected: str
    description: str
    sentiment: dict  # {"positive": float, "negative": float, "neutral": float}
    hourlyTrend: list[dict]  # [{"hour": str, "posts": int}]
    dailyTrend: list[dict]   # [{"day": str, "posts": int}]
    keywords: list[str]
    posts: list[TrendPost]


class RecentTrendRow(BaseModel):
    """Row in the 'Recent Trending Posts' table."""
    platform: str
    topic: str
    time: str


class ChartData(BaseModel):
    """Chart datasets for the trend analysis page."""
    topicsLine: list[dict]
    hashtagsBar: list[dict]
    platformDistribution: list[dict]
    dailyActivity: list[dict]


class TrendPageResponse(BaseModel):
    """Full response for GET /trends – everything the page needs in one call."""
    summary: TrendSummary
    items: list[TrendItem]
    recentRows: list[RecentTrendRow]
    charts: ChartData
