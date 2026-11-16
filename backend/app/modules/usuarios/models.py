# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownArgumentType=false
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Usuario(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, nullable=False)
    full_name: str = Field(nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    # El registro público crea usuarios con rol 'user' y la baja lógica se gestiona mediante 'disabled'
    role: str = Field(default="user", nullable=False)
    disabled: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=_utc_now, nullable=False)

    # Relación 1:N especificada en el modelo de dominio: Usuario.pedidos <-> Pedido.usuario
    pedidos: list["Pedido"] = Relationship(back_populates="usuario")