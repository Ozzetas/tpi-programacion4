import logging
from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork

logger = logging.getLogger(__name__)


class ProductoNoEncontrado(Exception):
    """Excepción lanzada cuando el producto no existe o tiene baja lógica."""


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar_productos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
            )
            # Hidrato la relación categoria dentro del bloque transaccional antes de convertir al schema de salida
            schemas_items: list[ProductoRead] = []
            for prod in items:
                _ = prod.categoria
                schemas_items.append(ProductoRead.model_validate(prod))

            return ProductosPaginados(total=total, items=schemas_items)

    def obtener_por_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado(
                    f"Producto con id {producto_id} no encontrado"
                )
            _ = producto.categoria
            return ProductoRead.model_validate(producto)

    def crear_producto(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if categoria is None or not categoria.activo:
                logger.warning(
                    "Intento de crear producto con categoría inexistente o dada de baja (id=%s)",
                    data.categoria_id,
                )
                raise CategoriaNoEncontrada(
                    f"Categoría con id {data.categoria_id} no encontrada o inactiva"
                )

            nuevo_producto = Producto(
                nombre=data.nombre.strip(),
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                categoria_id=data.categoria_id,
                activo=True,
            )
            uow.productos.add(nuevo_producto)
            _ = nuevo_producto.categoria
            return ProductoRead.model_validate(nuevo_producto)

    def actualizar_producto(
        self, producto_id: int, data: ProductoUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado(
                    f"Producto con id {producto_id} no encontrado"
                )

            campos_enviados = data.model_dump(exclude_unset=True)

            if (
                "categoria_id" in campos_enviados
                and campos_enviados["categoria_id"] is not None
            ):
                nueva_cat_id = int(campos_enviados["categoria_id"])
                categoria = uow.categorias.get_by_id(nueva_cat_id)
                if categoria is None or not categoria.activo:
                    logger.warning(
                        "Intento de asignar categoría inexistente o inactiva (id=%s) al producto id=%s",
                        nueva_cat_id,
                        producto_id,
                    )
                    raise CategoriaNoEncontrada(
                        f"La nueva categoría con id {nueva_cat_id} no existe o está inactiva"
                    )

            if "nombre" in campos_enviados and campos_enviados["nombre"] is not None:
                campos_enviados["nombre"] = str(campos_enviados["nombre"]).strip()

            for campo, valor in campos_enviados.items():
                setattr(producto, campo, valor)

            uow.productos.add(producto)
            _ = producto.categoria
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado(
                    f"Producto con id {producto_id} no encontrado"
                )

            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            _ = producto.categoria
            return ProductoRead.model_validate(producto)

    def eliminar_producto(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if producto is None or not producto.activo:
                raise ProductoNoEncontrado(
                    f"Producto con id {producto_id} no encontrado"
                )

            # Aplico baja lógica para conservar la integridad referencial histórica en DetallePedido
            producto.activo = False
            uow.productos.add(producto)