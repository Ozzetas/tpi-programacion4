# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownArgumentType=false
from datetime import datetime, timezone
from typing import Optional, Sequence
from sqlalchemy import ColumnElement, func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        self.session.refresh(detalle)
        return detalle

    def list_by_usuario(
        self,
        usuario_id: int,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> tuple[int, Sequence[Pedido]]:
        condiciones: list[ColumnElement[bool]] = [
            col(Pedido.usuario_id) == usuario_id
        ]
        if estado is not None and estado.strip():
            condiciones.append(col(Pedido.estado) == estado.strip())

        count_stmt = (
            select(func.count()).select_from(Pedido).where(*condiciones)
        )
        total = int(self.session.exec(count_stmt).one())

        items_stmt = (
            select(Pedido)
            .where(*condiciones)
            .order_by(col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        items = self.session.exec(items_stmt).all()
        return total, items

    def list_all(
        self,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> tuple[int, Sequence[Pedido]]:
        condiciones: list[ColumnElement[bool]] = []
        if estado is not None and estado.strip():
            condiciones.append(col(Pedido.estado) == estado.strip())

        count_stmt = select(func.count()).select_from(Pedido)
        if condiciones:
            count_stmt = count_stmt.where(*condiciones)
        total = int(self.session.exec(count_stmt).one())

        items_stmt = select(Pedido)
        if condiciones:
            items_stmt = items_stmt.where(*condiciones)
        items_stmt = (
            items_stmt.order_by(col(Pedido.id).desc())
            .offset(skip)
            .limit(limit)
        )
        items = self.session.exec(items_stmt).all()
        return total, items

    def count_by_estado(self, estado: str) -> int:
        # Utilizo func.count directamente en SQL según lo requerido por el schema ResumenPedidos
        stmt = (
            select(func.count())
            .select_from(Pedido)
            .where(col(Pedido.estado) == estado)
        )
        return int(self.session.exec(stmt).one())

    def count_pedidos_hoy(self) -> int:
        ahora = datetime.now(timezone.utc)
        inicio_dia = datetime(
            ahora.year, ahora.month, ahora.day, tzinfo=timezone.utc
        )
        stmt = (
            select(func.count())
            .select_from(Pedido)
            .where(col(Pedido.created_at) >= inicio_dia)
        )
        return int(self.session.exec(stmt).one())

    def sum_ingresos_entregados(self) -> float:
        stmt = (
            select(func.coalesce(func.sum(Pedido.total), 0.0))
            .where(col(Pedido.estado) == "ENTREGADO")
        )
        resultado = self.session.exec(stmt).one()
        return float(resultado)