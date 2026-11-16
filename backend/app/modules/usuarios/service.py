from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioNoEncontrado(Exception):
    """Se lanza cuando el ID de usuario solicitado no existe en la base de datos."""


class AutoDesactivacionNoPermitida(Exception):
    """Se lanza cuando un administrador intenta desactivar su propia cuenta."""


class UsuarioService:
    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar_usuarios(self, skip: int = 0, limit: int = 100) -> list[UserPublic]:
        with self.uow as uow:
            usuarios = uow.usuarios.get_all(skip=skip, limit=limit)
            return [UserPublic.model_validate(u) for u in usuarios]

    def activar_usuario(self, usuario_id: int) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(f"Usuario con id {usuario_id} no encontrado")

            # Operación idempotente: responde 200 aunque disabled ya sea False
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar_usuario(
        self, usuario_id: int, admin_actual_id: int
    ) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(usuario_id)
            if usuario is None:
                raise UsuarioNoEncontrado(f"Usuario con id {usuario_id} no encontrado")

            if usuario.id == admin_actual_id:
                raise AutoDesactivacionNoPermitida(
                    "El administrador no puede desactivarse a sí mismo"
                )

            # Operación idempotente: responde 200 aunque disabled ya sea True
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)