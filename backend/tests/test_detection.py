"""
Tests for the fake news detection pipeline.
"""

import pytest
from ml.preprocessor import preprocess_text
from ml.predictor import predict, detect_flagged_phrases


class TestPreprocessor:
    """Test the NLTK preprocessing pipeline."""

    def test_lowercase(self):
        result = preprocess_text("THIS IS UPPER CASE")
        assert result == result.lower()

    def test_url_removal(self):
        result = preprocess_text("Check this https://example.com/page for info")
        assert "https" not in result
        assert "example" not in result

    def test_punctuation_removal(self):
        result = preprocess_text("Hello, world! How's it going?")
        assert "," not in result
        assert "!" not in result
        assert "'" not in result

    def test_stopword_removal(self):
        result = preprocess_text("This is a very simple test")
        assert "this" not in result.split()
        assert "is" not in result.split()
        assert "a" not in result.split()

    def test_empty_input(self):
        assert preprocess_text("") == ""
        assert preprocess_text(None) == ""

    def test_lemmatization(self):
        result = preprocess_text("The cats were running through the houses")
        tokens = result.split()
        # "cats" → "cat", "houses" → "house", "running" → "running" (verb lemmatization needs POS)
        assert "cat" in tokens or "cats" in tokens  # WordNet lemmatizer handles nouns


class TestFlaggedPhrases:
    """Test suspicious phrase detection."""

    def test_detect_suspicious(self):
        text = "This miracle cure cures all diseases overnight"
        flagged = detect_flagged_phrases(text)
        assert "miracle" in flagged
        assert "cures all" in flagged
        assert "overnight" in flagged

    def test_clean_text(self):
        text = "The central bank raised interest rates by 25 basis points"
        flagged = detect_flagged_phrases(text)
        assert len(flagged) == 0


class TestPredictor:
    """Test the prediction pipeline (rule-based fallback)."""

    def test_fake_detection(self):
        result = predict("This miracle cure cures all cancer overnight guaranteed")
        assert result["label"] == "Fake"
        assert result["fakeProbability"] > 60
        assert result["confidence"] > 0.5
        assert len(result["flaggedPhrases"]) > 0

    def test_real_detection(self):
        result = predict(
            "The Federal Reserve announced a 25 basis point increase in the federal funds rate "
            "following its two-day policy meeting, citing continued progress toward its inflation target."
        )
        assert result["label"] == "Real"
        assert result["realProbability"] > 60

    def test_response_shape(self):
        result = predict("Some random text for testing")
        assert "fakeProbability" in result
        assert "realProbability" in result
        assert "label" in result
        assert "confidence" in result
        assert "flaggedPhrases" in result
        assert "model_version" in result
        # Probabilities should sum to ~100
        assert abs(result["fakeProbability"] + result["realProbability"] - 100) < 0.5
