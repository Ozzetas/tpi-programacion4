from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import (
    CategoriaCreate,
    CategoriaRead,
    CategoriaUpdate,
)
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
)
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


@router.get("", response_model=list[CategoriaRead], status_code=status.HTTP_200_OK)
def listar_categorias(
    service: CategoriaService = Depends(get_categoria_service),
) -> list[CategoriaRead]:
    return service.listar_activas()


@router.get("/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def obtener_categoria(
    id: int,
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.obtener_por_id(id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.post(
    "", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED
)
def crear_categoria(
    data: CategoriaCreate,
    _admin: UserPublic = Depends(require_role("admin")),
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.crear_categoria(data)
    except NombreDuplicado as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.put("/{id}", response_model=CategoriaRead, status_code=status.HTTP_200_OK)
def actualizar_categoria(
    id: int,
    data: CategoriaUpdate,
    _admin: UserPublic = Depends(require_role("admin")),
    service: CategoriaService = Depends(get_categoria_service),
) -> CategoriaRead:
    try:
        return service.actualizar_categoria(id, data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except NombreDuplicado as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    id: int,
    _admin: UserPublic = Depends(require_role("admin")),
    service: CategoriaService = Depends(get_categoria_service),
) -> Response:
    try:
        service.eliminar_categoria(id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc