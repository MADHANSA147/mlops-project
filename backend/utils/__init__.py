"""
Structured logging configuration for the AIPI backend.
Provides a pre-configured logger with JSON-style formatting.
"""

import logging
import sys


def setup_logging(level: int = logging.INFO) -> logging.Logger:
    """Create and configure the root application logger."""

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    logger = logging.getLogger("aipi")
    logger.setLevel(level)

    # Avoid duplicate handlers on repeated calls
    if not logger.handlers:
        logger.addHandler(handler)

    # Suppress noisy third-party loggers
    for noisy in ("uvicorn.access", "apscheduler", "praw", "urllib3"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    return logger


# Module-level singleton – import `logger` anywhere
logger = setup_logging()
