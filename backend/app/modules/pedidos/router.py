from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    data: PedidoCreate,
    current_user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear_pedido(usuario_id=current_user.id, data=data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except (
        ProductoRepetido,
        ProductoNoDisponible,
        StockInsuficiente,
        TransicionInvalida,
    ) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.get("", response_model=PedidosPaginados, status_code=status.HTTP_200_OK)
def listar_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: Optional[str] = Query(default=None),
    current_user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    return service.listar_pedidos(
        usuario=current_user, skip=skip, limit=limit, estado=estado
    )


# Declaro /resumen antes de /{id} según la especificación para que FastAPI no evalúe 'resumen' como parámetro entero
@router.get(
    "/resumen", response_model=ResumenPedidos, status_code=status.HTTP_200_OK
)
def obtener_resumen_pedidos(
    _admin: UserPublic = Depends(require_role("admin")),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.obtener_resumen()


@router.get("/{id}", response_model=PedidoRead, status_code=status.HTTP_200_OK)
def obtener_pedido(
    id: int,
    current_user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener_pedido(pedido_id=id, usuario=current_user)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)
        ) from exc


@router.patch(
    "/{id}/estado", response_model=PedidoRead, status_code=status.HTTP_200_OK
)
def cambiar_estado_pedido(
    id: int,
    data: CambioEstado,
    _admin: UserPublic = Depends(require_role("admin")),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id=id, nuevo_estado=data.estado)
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc


@router.patch(
    "/{id}/cancelar", response_model=PedidoRead, status_code=status.HTTP_200_OK
)
def cancelar_pedido(
    id: int,
    current_user: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar_pedido_cliente(
            pedido_id=id, usuario=current_user
        )
    except PedidoNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except PedidoAjeno as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)
        ) from exc
    except TransicionInvalida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc