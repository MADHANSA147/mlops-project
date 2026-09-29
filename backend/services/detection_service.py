"""
Fake news detection service – orchestrates preprocessing, prediction, and storage.
"""

from datetime import datetime, timezone
from uuid import uuid4

from ml.predictor import predict
from repositories import prediction_repo
from models.detection import DetectionResponse
from utils.logger import logger


async def analyze_text(text: str, user_id: str | None = None) -> DetectionResponse:
    """Run the detection pipeline on input text and store the result."""
    result = predict(text)

    detection_id = f"det-{uuid4().hex[:12]}"

    response = DetectionResponse(
        id=detection_id,
        text=text,
        fakeProbability=result["fakeProbability"],
        realProbability=result["realProbability"],
        label=result["label"],
        confidence=result["confidence"],
        flaggedPhrases=result["flaggedPhrases"],
        timestamp=datetime.now(timezone.utc).isoformat(),
        model_version=result["model_version"],
    )

    # Persist to MongoDB
    await prediction_repo.save_prediction({
        "prediction_id": detection_id,
        "user_id": user_id,
        "text": text,
        "fakeProbability": result["fakeProbability"],
        "realProbability": result["realProbability"],
        "label": result["label"],
        "confidence": result["confidence"],
        "flaggedPhrases": result["flaggedPhrases"],
        "model_version": result["model_version"],
        "timestamp": datetime.now(timezone.utc),
    })

    logger.info("Detection [%s]: label=%s confidence=%.2f", detection_id, result["label"], result["confidence"])
    return response


async def get_detection_history(user_id: str | None = None, limit: int = 20) -> list[DetectionResponse]:
    """Return recent detection results."""
    raw = await prediction_repo.get_history(user_id, limit)
    return [
        DetectionResponse(
            id=r.get("prediction_id", str(r.get("_id", ""))),
            text=r["text"],
            fakeProbability=r["fakeProbability"],
            realProbability=r["realProbability"],
            label=r["label"],
            confidence=r["confidence"],
            flaggedPhrases=r.get("flaggedPhrases", []),
            timestamp=r["timestamp"].isoformat() if isinstance(r["timestamp"], datetime) else r["timestamp"],
            model_version=r.get("model_version", "v1.0"),
        )
        for r in raw
    ]
