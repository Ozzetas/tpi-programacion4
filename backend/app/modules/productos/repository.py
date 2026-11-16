# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownArgumentType=false
from typing import Optional, Sequence
from sqlalchemy import ColumnElement, func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> tuple[int, Sequence[Producto]]:
        # Tipamos con la interfaz base ColumnElement[bool] para admitir tanto BinaryExpression como operadores ilike
        condiciones: list[ColumnElement[bool]] = [
            col(Producto.activo).is_(True)
        ]

        if search is not None and search.strip():
            patron = f"%{search.strip()}%"
            condiciones.append(col(Producto.nombre).ilike(patron))

        if categoria_id is not None:
            condiciones.append(col(Producto.categoria_id) == categoria_id)

        if disponible is not None:
            condiciones.append(col(Producto.disponible).is_(disponible))

        count_statement = (
            select(func.count()).select_from(Producto).where(*condiciones)
        )
        total = int(self.session.exec(count_statement).one())

        items_statement = (
            select(Producto)
            .where(*condiciones)
            .order_by(col(Producto.id))
            .offset(skip)
            .limit(limit)
        )
        items = self.session.exec(items_statement).all()

        return total, items