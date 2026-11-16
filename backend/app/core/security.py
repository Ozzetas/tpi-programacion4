from datetime import datetime, timedelta, timezone
import logging
from typing import Any, Optional, Protocol, cast

from jose import JWTError, jwt  # type: ignore[import-untyped]
from passlib.context import CryptContext  # type: ignore[import-untyped]

from app.core.config import settings

logger = logging.getLogger(__name__)


# Definimos un Protocol para tipar estrictamente CryptContext ya que passlib 1.7.4 no incluye stubs de tipos
class _PasswordCryptContext(Protocol):
    def verify(self, secret: str, hash: str) -> bool: ...
    def hash(self, secret: str) -> str: ...


pwd_context: _PasswordCryptContext = cast(
    _PasswordCryptContext,
    CryptContext(schemes=["bcrypt"], deprecated="auto"),
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(
    data: dict[str, Any], expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta
        if expires_delta is not None
        else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt: str = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    try:
        payload: dict[str, Any] = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError as exc:
        logger.warning("Token JWT inválido o expirado: %s", exc)
        return None