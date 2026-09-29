"""
Model training pipeline for fake news detection.

Uses:
  - Clément Bisaillon's Fake and Real News Dataset (Fake.csv + True.csv)
  - TF-IDF vectorizer (max_features=50000, ngram_range=(1,2))
  - Logistic Regression (max_iter=1000)
  - MLflow for experiment tracking

Run directly:
  python -m ml.trainer
"""

import os
import sys
import time
import joblib
import pandas as pd
import mlflow
import mlflow.sklearn

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Add parent dir to path so we can import from project root
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.preprocessor import preprocess_batch
from config import get_settings
from utils.logger import logger

settings = get_settings()

# ── Paths ────────────────────────────────────────────────────────
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_FILE = os.path.join(ARTIFACTS_DIR, "model.joblib")
VECTORIZER_FILE = os.path.join(ARTIFACTS_DIR, "vectorizer.joblib")
METADATA_FILE = os.path.join(ARTIFACTS_DIR, "metadata.joblib")


def load_dataset() -> pd.DataFrame:
    """Load and label the Fake.csv and True.csv datasets."""
    fake_path = os.path.join(DATA_DIR, "Fake.csv")
    true_path = os.path.join(DATA_DIR, "True.csv")

    if not os.path.exists(fake_path) or not os.path.exists(true_path):
        logger.error(
            "Dataset files not found. Place Fake.csv and True.csv in %s", DATA_DIR
        )
        raise FileNotFoundError(
            f"Missing dataset files in {DATA_DIR}. "
            "Download from Kaggle: https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset"
        )

    fake_df = pd.read_csv(fake_path)
    true_df = pd.read_csv(true_path)

    fake_df["label"] = 0  # Fake
    true_df["label"] = 1  # Real

    df = pd.concat([fake_df, true_df], ignore_index=True)
    # Combine title + text for richer features
    df["full_text"] = df["title"].fillna("") + " " + df["text"].fillna("")
    df = df.dropna(subset=["full_text"])

    logger.info("Dataset loaded: %d fake, %d real, %d total", len(fake_df), len(true_df), len(df))
    return df


def train() -> dict:
    """Train the model and save artifacts. Returns metrics dict."""
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    # ── Load data ────────────────────────────────────────────────
    df = load_dataset()

    # ── Preprocess ───────────────────────────────────────────────
    logger.info("Preprocessing %d texts...", len(df))
    start = time.time()
    df["cleaned"] = preprocess_batch(df["full_text"].tolist())
    preprocess_time = time.time() - start
    logger.info("Preprocessing done in %.1fs", preprocess_time)

    # ── Train / test split ───────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        df["cleaned"], df["label"], test_size=0.2, random_state=42, stratify=df["label"]
    )

    # ── TF-IDF vectorization ─────────────────────────────────────
    logger.info("Fitting TF-IDF vectorizer...")
    vectorizer = TfidfVectorizer(max_features=50000, ngram_range=(1, 2), sublinear_tf=True)
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    # ── Logistic Regression ──────────────────────────────────────
    logger.info("Training Logistic Regression...")
    model = LogisticRegression(max_iter=1000, C=1.0, solver="lbfgs", random_state=42)
    model.fit(X_train_tfidf, y_train)

    # ── Evaluate ─────────────────────────────────────────────────
    y_pred = model.predict(X_test_tfidf)
    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred) * 100, 2),
        "precision": round(precision_score(y_test, y_pred) * 100, 2),
        "recall": round(recall_score(y_test, y_pred) * 100, 2),
        "f1_score": round(f1_score(y_test, y_pred) * 100, 2),
    }
    logger.info("Metrics: %s", metrics)

    # ── Save artifacts ───────────────────────────────────────────
    joblib.dump(model, MODEL_FILE)
    joblib.dump(vectorizer, VECTORIZER_FILE)
    metadata = {"version": "v1.0", "metrics": metrics, "features": vectorizer.get_feature_names_out().shape[0]}
    joblib.dump(metadata, METADATA_FILE)
    logger.info("Artifacts saved to %s", ARTIFACTS_DIR)

    # ── MLflow logging ───────────────────────────────────────────
    mlflow.set_tracking_uri(settings.mlflow_tracking_uri)
    mlflow.set_experiment("fake_news_detection")

    with mlflow.start_run(run_name="logistic_regression_tfidf"):
        mlflow.log_params({
            "max_features": 50000,
            "ngram_range": "(1, 2)",
            "max_iter": 1000,
            "solver": "lbfgs",
            "test_size": 0.2,
        })
        mlflow.log_metrics(metrics)
        mlflow.sklearn.log_model(model, "model")
        mlflow.log_artifact(VECTORIZER_FILE)
        mlflow.log_artifact(METADATA_FILE)
        logger.info("MLflow run logged successfully")

    return metrics


if __name__ == "__main__":
    print("=" * 60)
    print("  AIPI – Fake News Detection Model Training")
    print("=" * 60)
    result = train()
    print(f"\nTraining complete! Metrics: {result}")
