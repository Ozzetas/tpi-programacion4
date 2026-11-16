from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacionNoPermitida,
    UsuarioNoEncontrado,
    UsuarioService,
)
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Administración de Usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic], status_code=status.HTTP_200_OK)
def listar_usuarios(
    _admin: UserPublic = Depends(require_role("admin")),
    service: UsuarioService = Depends(get_usuario_service),
) -> list[UserPublic]:
    return service.listar_usuarios()


@router.post(
    "/{id}/activar", response_model=UserPublic, status_code=status.HTTP_200_OK
)
def activar_usuario(
    id: int,
    _admin: UserPublic = Depends(require_role("admin")),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    try:
        return service.activar_usuario(id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc


@router.post(
    "/{id}/desactivar", response_model=UserPublic, status_code=status.HTTP_200_OK
)
def desactivar_usuario(
    id: int,
    admin: UserPublic = Depends(require_role("admin")),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    try:
        return service.desactivar_usuario(id, admin_actual_id=admin.id)
    except UsuarioNoEncontrado as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
        ) from exc
    except AutoDesactivacionNoPermitida as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc