# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownArgumentType=false
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", nullable=False)
    # El pedido inicia en PENDIENTE y solo transiciona mediante el mapa de estados del Service (RN-02)
    estado: str = Field(default="PENDIENTE", nullable=False)
    forma_pago: str = Field(nullable=False)
    direccion_entrega: str = Field(min_length=5, max_length=200, nullable=False)
    notas: Optional[str] = Field(default=None)
    total: float = Field(default=0.0, ge=0, nullable=False)
    created_at: datetime = Field(default_factory=_utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=_utc_now, nullable=False)

    # Relaciones 1:N: Usuario.pedidos <-> Pedido.usuario y Pedido.items <-> DetallePedido.pedido
    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", nullable=False)
    producto_id: int = Field(foreign_key="producto.id", nullable=False)
    cantidad: int = Field(ge=1, nullable=False)
    # Inmutabilidad histórica (RN-05): se persiste una copia del nombre y del precio unitario del producto
    nombre_producto: str = Field(nullable=False)
    precio_unitario: float = Field(ge=0, nullable=False)
    subtotal: float = Field(ge=0, nullable=False)

    pedido: Optional["Pedido"] = Relationship(back_populates="items")
    producto: Optional["Producto"] = Relationship(back_populates="detalles")