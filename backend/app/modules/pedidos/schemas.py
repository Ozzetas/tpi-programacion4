# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownArgumentType=false
from datetime import datetime
from typing import Literal, Optional
from sqlmodel import Field, SQLModel

FormaPagoLiteral = Literal["EFECTIVO", "TRANSFERENCIA"]
EstadoPedidoLiteral = Literal[
    "PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"
]


class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    # RN-01 y RN-06: valido en el schema que el pedido tenga al menos 1 ítem, forma de pago permitida y dirección entre 5 y 200 caracteres
    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPagoLiteral
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = None


class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead] = []


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class CambioEstado(SQLModel):
    estado: EstadoPedidoLiteral


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float