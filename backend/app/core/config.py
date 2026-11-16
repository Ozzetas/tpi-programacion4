from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolvemos la ruta absoluta hacia backend/.env para que funcione tanto al correr uvicorn como el seed
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default="sqlite:///./foodstore.db",
        description="URL de conexión a PostgreSQL o SQLite para desarrollo local",
    )
    # Definimos el valor por defecto del enunciado (>= 32 caracteres) para satisfacer el chequeo estático de tipos
    SECRET_KEY: str = Field(
        default="cambiar-esta-clave-de-al-menos-32-caracteres",
        min_length=32,
        description="Clave secreta para firmar los tokens JWT (mínimo 32 caracteres)",
    )
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, gt=0)
    FRONTEND_ORIGIN: str = Field(default="http://localhost:5173")

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()