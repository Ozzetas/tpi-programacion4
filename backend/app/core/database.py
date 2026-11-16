from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# Si se usa SQLite en desarrollo local, deshabilitamos check_same_thread para FastAPI
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
    """Crea todas las tablas registradas en el metadata de SQLModel."""
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    """Retorna una nueva instancia de sesión de SQLModel."""
    return Session(engine)