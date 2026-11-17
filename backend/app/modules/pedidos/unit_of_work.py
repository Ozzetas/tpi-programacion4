from typing import Self

from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    pedidos: PedidoRepository
    productos: ProductoRepository

    def __enter__(self) -> Self:
        super().__enter__()
        assert self.session is not None
        # Comparto la misma instancia de sesión entre pedidos y productos para asegurar atomicidad transaccional
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self