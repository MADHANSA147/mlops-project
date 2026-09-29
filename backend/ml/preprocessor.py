"""
NLTK text preprocessing pipeline for fake news detection.

Steps:
  1. Lowercase
  2. Remove URLs
  3. Remove punctuation
  4. Tokenize
  5. Remove stopwords
  6. Lemmatize
"""

import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer


def ensure_nltk_data() -> None:
    """Download required NLTK datasets if not already present."""
    for resource in ["punkt", "punkt_tab", "stopwords", "wordnet", "omw-1.4"]:
        try:
            nltk.data.find(f"tokenizers/{resource}" if "punkt" in resource else f"corpora/{resource}")
        except LookupError:
            nltk.download(resource, quiet=True)


# Initialize on module import
ensure_nltk_data()

_lemmatizer = WordNetLemmatizer()
_stop_words = set(stopwords.words("english"))

# Regex for URL removal
_url_pattern = re.compile(r"https?://\S+|www\.\S+")


def preprocess_text(text: str) -> str:
    """Run the full preprocessing pipeline and return cleaned text."""
    if not text:
        return ""

    # 1. Lowercase
    text = text.lower()

    # 2. Remove URLs
    text = _url_pattern.sub("", text)

    # 3. Remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))

    # 4. Tokenize
    tokens = word_tokenize(text)

    # 5. Remove stopwords
    tokens = [t for t in tokens if t not in _stop_words and len(t) > 1]

    # 6. Lemmatize
    tokens = [_lemmatizer.lemmatize(t) for t in tokens]

    return " ".join(tokens)


def preprocess_batch(texts: list[str]) -> list[str]:
    """Preprocess a list of texts."""
    return [preprocess_text(t) for t in texts]
