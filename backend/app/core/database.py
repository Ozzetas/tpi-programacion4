from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# En entorno de desarrollo local con SQLite deshabilitamos check_same_thread para soportar el pool de hilos de FastAPI
connect_args = (
    {"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {}
)

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    pool_pre_ping=True,
)


def create_all_tables() -> None:
    """Importa todos los modelos de dominio para registrarlos en el metadata y crea las tablas."""
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido, Pedido
    from app.modules.productos.models import Producto
    from app.modules.usuarios.models import Usuario

    # Referenciamos explícitamente las 5 entidades del UML para asegurar su carga en SQLModel.metadata
    _registered_models = (Categoria, DetallePedido, Pedido, Producto, Usuario)
    assert len(_registered_models) == 5

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Retorna una nueva instancia de sesión de SQLModel administrada por el Unit of Work."""
    return Session(engine)