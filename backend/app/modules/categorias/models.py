# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownArgumentType=false
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # La baja lógica (activo=False) mantiene reservado el nombre único en la base de datos
    nombre: str = Field(
        unique=True, index=True, min_length=2, max_length=100, nullable=False
    )
    descripcion: Optional[str] = Field(default=None)
    activo: bool = Field(default=True, nullable=False)

    # Relación 1:N especificada en el modelo de dominio: Categoria.productos <-> Producto.categoria
    productos: list["Producto"] = Relationship(back_populates="categoria")