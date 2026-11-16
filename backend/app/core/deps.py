from typing import Callable, Optional
from fastapi import Cookie, Depends, HTTPException, status

from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


def get_current_user(
    access_token: Optional[str] = Cookie(default=None),
) -> UserPublic:
    """Extrae y valida el JWT desde la cookie HttpOnly access_token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales de sesión",
    )
    if not access_token:
        raise credentials_exception

    payload = decode_access_token(access_token)
    if payload is None:
        raise credentials_exception

    username: Optional[str] = payload.get("sub")
    if not username:
        raise credentials_exception

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise credentials_exception
        return UserPublic.model_validate(usuario)


def get_current_active_user(
    current_user: UserPublic = Depends(get_current_user),
) -> UserPublic:
    """Rechaza peticiones de cuentas dadas de baja lógica con el código 400 exigido."""
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada",
        )
    return current_user


def require_role(*allowed_roles: str) -> Callable[[UserPublic], UserPublic]:
    """Genera una dependencia que verifica si el usuario activo posee alguno de los roles permitidos."""

    def role_checker(
        current_user: UserPublic = Depends(get_current_active_user),
    ) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos suficientes para realizar esta operación",
            )
        return current_user

    return role_checker