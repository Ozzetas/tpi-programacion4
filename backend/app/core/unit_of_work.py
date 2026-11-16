from types import TracebackType
from typing import Callable, Optional, Self, Type

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import Session
import logging

from app.core.database import session_factory

logger = logging.getLogger(__name__)


class UnitOfWork:
    """Gestiona el ciclo de vida transaccional garantizando atomicidad en __exit__."""

    def __init__(
        self, session_creator: Callable[[], Session] = session_factory
    ) -> None:
        self._session_creator = session_creator
        self.session: Optional[Session] = None

    def __enter__(self) -> Self:
        self.session = self._session_creator()
        return self

    def __exit__(
        self,
        exc_type: Optional[Type[BaseException]],
        exc_val: Optional[BaseException],
        exc_tb: Optional[TracebackType],
    ) -> None:
        if self.session is None:
            return

        try:
            if exc_type is not None:
                logger.warning(
                    "Revertiendo transacción por excepción (%s): %s",
                    exc_type.__name__,
                    exc_val,
                )
                self.session.rollback()
            else:
                self.session.commit()
        except SQLAlchemyError as db_exc:
            logger.error("Error de base de datos al confirmar transacción: %s", db_exc)
            self.session.rollback()
            raise
        finally:
            self.session.close()
            self.session = None