from app.core.security import get_password_hash, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioDuplicado(Exception):
    """Se lanza cuando el username o el email ya están registrados."""


class CredencialesInvalidas(Exception):
    """Se lanza cuando el usuario no existe o la contraseña no coincide."""


class CuentaDesactivada(Exception):
    """Se lanza cuando un usuario con disabled=True intenta iniciar sesión."""


class AuthService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar_usuario(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username) is not None:
                raise UsuarioDuplicado("El nombre de usuario ya está registrado")

            if uow.usuarios.get_by_email(str(data.email)) is not None:
                raise UsuarioDuplicado("El correo electrónico ya está registrado")

            nuevo_usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=str(data.email),
                hashed_password=get_password_hash(data.password),
                role="user",
                disabled=False,
            )
            uow.usuarios.add(nuevo_usuario)
            return UserPublic.model_validate(nuevo_usuario)

    def autenticar_usuario(self, username: str, password: str) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if usuario is None or not verify_password(
                password, usuario.hashed_password
            ):
                raise CredencialesInvalidas("Usuario o contraseña incorrectos")

            if usuario.disabled:
                raise CuentaDesactivada("Cuenta de usuario desactivada")

            return UserPublic.model_validate(usuario)