"""
Tests for authentication utilities.
"""

import pytest
from utils.security import hash_password, verify_password, create_access_token, decode_token


class TestPasswordHashing:
    """Test bcrypt password hashing and verification."""

    def test_hash_and_verify(self):
        password = "mysecretpassword"
        hashed = hash_password(password)
        assert hashed != password
        assert verify_password(password, hashed)

    def test_wrong_password_fails(self):
        hashed = hash_password("correct_password")
        assert not verify_password("wrong_password", hashed)

    def test_different_hashes(self):
        """Two hashes of the same password should be different (bcrypt salt)."""
        p = "same_password"
        h1 = hash_password(p)
        h2 = hash_password(p)
        assert h1 != h2
        assert verify_password(p, h1)
        assert verify_password(p, h2)


class TestJWT:
    """Test JWT token creation and decoding."""

    def test_create_and_decode(self):
        data = {"sub": "user123", "email": "test@test.com", "name": "Test"}
        token = create_access_token(data)
        payload = decode_token(token)
        assert payload["sub"] == "user123"
        assert payload["email"] == "test@test.com"
        assert payload["name"] == "Test"
        assert "exp" in payload

    def test_invalid_token_raises(self):
        from fastapi import HTTPException
        with pytest.raises(HTTPException) as exc_info:
            decode_token("invalid.token.here")
        assert exc_info.value.status_code == 401
