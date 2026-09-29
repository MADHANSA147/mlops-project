"""
Structured logging configuration for the AIPI backend.
"""

import logging
import sys


def setup_logging(level: int = logging.INFO) -> logging.Logger:
    """Create and configure the application logger."""

    formatter = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    logger = logging.getLogger("aipi")
    logger.setLevel(level)

    if not logger.handlers:
        logger.addHandler(handler)

    # Suppress noisy third-party loggers
    for noisy in ("uvicorn.access", "apscheduler", "praw", "urllib3", "motor"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    return logger


logger = setup_logging()
