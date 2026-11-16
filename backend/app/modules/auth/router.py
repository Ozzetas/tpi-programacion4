from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import AuthMessage
from app.modules.auth.service import (
    AuthService,
    CredencialesInvalidas,
    CuentaDesactivada,
    UsuarioDuplicado,
)
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post(
    "/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED
)
def register(
    user_in: UserCreate,
    service: AuthService = Depends(get_auth_service),
) -> UserPublic:
    try:
        return service.registrar_usuario(user_in)
    except UsuarioDuplicado as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=str(exc)
        ) from exc


@router.post("/token", response_model=AuthMessage, status_code=status.HTTP_200_OK)
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
) -> AuthMessage:
    try:
        usuario = service.autenticar_usuario(
            form_data.username, form_data.password
        )
    except CredencialesInvalidas as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc
    except CuentaDesactivada as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc

    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": usuario.username, "role": usuario.role},
        expires_delta=expires_delta,
    )

    # El JWT se almacena exclusivamente en cookie HttpOnly; el frontend no lee ni persiste el token
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        expires=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
        path="/",
    )
    return AuthMessage(message="Login exitoso")


@router.post("/logout", response_model=AuthMessage, status_code=status.HTTP_200_OK)
def logout(response: Response) -> AuthMessage:
    response.delete_cookie(key="access_token", path="/", samesite="lax")
    return AuthMessage(message="Sesión cerrada correctamente")


@router.get("/me", response_model=UserPublic, status_code=status.HTTP_200_OK)
def read_users_me(
    current_user: UserPublic = Depends(get_current_active_user),
) -> UserPublic:
    return current_user