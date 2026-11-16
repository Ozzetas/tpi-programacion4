# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownArgumentType=false
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", nullable=False)
    nombre: str = Field(index=True, nullable=False)
    descripcion: Optional[str] = Field(default=None)
    precio_base: float = Field(ge=0, nullable=False)
    imagen_url: Optional[str] = Field(default=None)
    # El stock se descuenta al crear un pedido (RN-01) y se restituye al cancelarlo (RN-03)
    stock: int = Field(default=0, ge=0, nullable=False)
    disponible: bool = Field(default=True, nullable=False)
    activo: bool = Field(default=True, nullable=False)

    # Relaciones bidireccionales requeridas para poblar ProductoRead y vincular líneas de pedido
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: list["DetallePedido"] = Relationship(back_populates="producto")