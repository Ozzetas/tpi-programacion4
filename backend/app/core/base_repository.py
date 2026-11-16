from typing import Generic, Optional, Sequence, Type, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Repositorio genérico base para operaciones de persistencia sin reglas de negocio."""

    def __init__(self, session: Session, model: Type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, entity_id: int) -> Optional[T]:
        return self.session.get(self.model, entity_id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        statement = select(self.model).offset(skip).limit(limit)
        return self.session.exec(statement).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        # Flush sincroniza el estado en la transacción abierta para disponer del ID autogenerado sin hacer commit
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()