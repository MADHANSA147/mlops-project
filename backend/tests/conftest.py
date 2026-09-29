"""
Pytest configuration and shared fixtures.
"""

import os
import sys
import pytest

# Ensure the backend root is on the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def sample_texts():
    """Sample texts for testing the detection pipeline."""
    return {
        "fake": "Scientists discovered that drinking lemon water cures all forms of cancer overnight.",
        "real": "The central bank raised its benchmark interest rate by 25 basis points at today's policy meeting.",
        "uncertain": "Some sources suggest the new policy could impact thousands of people.",
    }


@pytest.fixture
def sample_user():
    """Sample user data for auth testing."""
    return {
        "email": "test@example.com",
        "password": "securepassword123",
        "name": "Test User",
    }
