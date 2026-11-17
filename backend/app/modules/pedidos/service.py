from datetime import datetime, timezone
import logging
from typing import Optional

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

logger = logging.getLogger(__name__)


class PedidoNoEncontrado(Exception):
    """Excepción lanzada cuando el pedido solicitado no existe."""


class PedidoAjeno(Exception):
    """Excepción lanzada cuando un cliente intenta acceder o cancelar un pedido de otro usuario."""


class ProductoRepetido(Exception):
    """Excepción lanzada cuando el carrito enviado contiene el mismo producto más de una vez."""


class ProductoNoDisponible(Exception):
    """Excepción lanzada cuando se intenta comprar un producto con disponible=False."""


class StockInsuficiente(Exception):
    """Excepción lanzada cuando la cantidad solicitada supera el stock actual del producto."""


class TransicionInvalida(Exception):
    """Excepción lanzada cuando se solicita un cambio de estado no permitido por la máquina de estados."""


class PedidoService:
    # RN-02: defino el mapa de transiciones válidas como diccionario en el Service para validar todo cambio de estado
    TRANSICIONES_VALIDAS: dict[str, set[str]] = {
        "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
        "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
        "ENTREGADO": set(),
        "CANCELADO": set(),
    }

    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    def crear_pedido(
        self, usuario_id: int, data: PedidoCreate
    ) -> PedidoRead:
        with self.uow as uow:
            # RN-01: verifico que no existan productos repetidos en las líneas del pedido antes de operar en la BD
            ids_productos = [item.producto_id for item in data.items]
            if len(ids_productos) != len(set(ids_productos)):
                raise ProductoRepetido(
                    "No se permiten productos repetidos entre los ítems del pedido"
                )

            direccion_limpia = data.direccion_entrega.strip()
            if len(direccion_limpia) < 5:
                raise TransicionInvalida(
                    "La dirección de entrega debe tener al menos 5 caracteres válidos"
                )

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=direccion_limpia,
                notas=data.notas,
                total=0.0,
            )
            uow.pedidos.add(pedido)
            assert pedido.id is not None

            total_acumulado = 0.0

            # RN-01 y RN-05: en la misma iteración verifico disponibilidad/stock, descuento stock y copio nombre y precio histórico
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"El producto con id {item.producto_id} no existe o está inactivo"
                    )

                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no se encuentra disponible para la venta"
                    )

                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}' (disponible: {producto.stock}, solicitado: {item.cantidad})"
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.pedidos.add_detalle(detalle)
                total_acumulado += subtotal

            pedido.total = round(total_acumulado, 2)
            uow.pedidos.add(pedido)

            # Hidrato las líneas dentro del bloque del Unit of Work antes de convertir al schema PedidoRead
            _ = pedido.items
            return PedidoRead.model_validate(pedido)

    def listar_pedidos(
        self,
        usuario: UserPublic,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            # RN-04: el administrador visualiza todos los pedidos; el cliente solo consulta los propios
            if usuario.role == "admin":
                total, items = uow.pedidos.list_all(
                    skip=skip, limit=limit, estado=estado
                )
            else:
                total, items = uow.pedidos.list_by_usuario(
                    usuario_id=usuario.id,
                    skip=skip,
                    limit=limit,
                    estado=estado,
                )

            pedidos_read: list[PedidoRead] = []
            for p in items:
                _ = p.items
                pedidos_read.append(PedidoRead.model_validate(p))

            return PedidosPaginados(total=total, items=pedidos_read)

    def obtener_pedido(
        self, pedido_id: int, usuario: UserPublic
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(
                    f"Pedido con id {pedido_id} no encontrado"
                )

            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno(
                    "No tiene permiso para acceder a un pedido de otro usuario"
                )

            _ = pedido.items
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(
        self, pedido_id: int, nuevo_estado: str
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(
                    f"Pedido con id {pedido_id} no encontrado"
                )

            estados_permitidos = self.TRANSICIONES_VALIDAS.get(
                pedido.estado, set()
            )
            if nuevo_estado not in estados_permitidos:
                logger.warning(
                    "Transición de estado inválida en pedido id=%s: %s -> %s",
                    pedido_id,
                    pedido.estado,
                    nuevo_estado,
                )
                raise TransicionInvalida(
                    f"No se puede pasar un pedido de '{pedido.estado}' a '{nuevo_estado}'"
                )

            # RN-03: si el pedido pasa a CANCELADO, restituyo el stock de cada línea en la misma transacción
            if nuevo_estado == "CANCELADO":
                for linea in pedido.items:
                    producto = uow.productos.get_by_id(linea.producto_id)
                    if producto is not None:
                        producto.stock += linea.cantidad
                        uow.productos.add(producto)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)

            _ = pedido.items
            return PedidoRead.model_validate(pedido)

    def cancelar_pedido_cliente(
        self, pedido_id: int, usuario: UserPublic
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado(
                    f"Pedido con id {pedido_id} no encontrado"
                )

            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno(
                    "No puede cancelar un pedido que pertenece a otro usuario"
                )

            # RN-04: el cliente dueño solo puede cancelar su pedido si aún permanece en estado PENDIENTE
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    "Solo se pueden cancelar pedidos que estén en estado PENDIENTE"
                )

            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.productos.add(producto)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)

            _ = pedido.items
            return PedidoRead.model_validate(pedido)

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_pedidos_hoy(),
                ingresos_entregados=round(
                    uow.pedidos.sum_ingresos_entregados(), 2
                ),
            )