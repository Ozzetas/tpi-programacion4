import logging

from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

logger = logging.getLogger(__name__)


class CategoriaNoEncontrada(Exception):
    """Se lanza cuando la categoría no existe o se encuentra dada de baja lógica."""


class NombreDuplicado(Exception):
    """Se lanza cuando se intenta registrar o actualizar una categoría con un nombre ya utilizado."""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar_activas(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.list_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_por_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada(
                    f"Categoría con id {categoria_id} no encontrada"
                )
            return CategoriaRead.model_validate(categoria)

    def crear_categoria(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre_limpio = data.nombre.strip()
            # Verificamos unicidad sobre toda la tabla porque la baja lógica no libera el nombre único
            if uow.categorias.get_by_nombre(nombre_limpio) is not None:
                logger.warning(
                    "Intento de crear categoría con nombre duplicado: %s",
                    nombre_limpio,
                )
                raise NombreDuplicado(
                    f"Ya existe una categoría con el nombre '{nombre_limpio}'"
                )

            nueva_categoria = Categoria(
                nombre=nombre_limpio,
                descripcion=data.descripcion,
                activo=True,
            )
            uow.categorias.add(nueva_categoria)
            return CategoriaRead.model_validate(nueva_categoria)

    def actualizar_categoria(
        self, categoria_id: int, data: CategoriaUpdate
    ) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada(
                    f"Categoría con id {categoria_id} no encontrada"
                )

            campos_enviados = data.model_dump(exclude_unset=True)

            if "nombre" in campos_enviados and campos_enviados["nombre"] is not None:
                nuevo_nombre = str(campos_enviados["nombre"]).strip()
                existente = uow.categorias.get_by_nombre(nuevo_nombre)
                if existente is not None and existente.id != categoria.id:
                    logger.warning(
                        "Conflicto de nombre duplicado al actualizar categoría id=%s a '%s'",
                        categoria_id,
                        nuevo_nombre,
                    )
                    raise NombreDuplicado(
                        f"Ya existe una categoría con el nombre '{nuevo_nombre}'"
                    )
                campos_enviados["nombre"] = nuevo_nombre

            for campo, valor in campos_enviados.items():
                setattr(categoria, campo, valor)

            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar_categoria(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if categoria is None or not categoria.activo:
                raise CategoriaNoEncontrada(
                    f"Categoría con id {categoria_id} no encontrada"
                )

            # Baja lógica: desactivamos el registro sin eliminar la fila ni ocultar automáticamente sus productos
            categoria.activo = False
            uow.categorias.add(categoria)