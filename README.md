# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador de la asignatura **Programación IV** — **Tecnicatura Universitaria en Programación a Distancia (UTN)**.

# Estudiante: Roqué, Gabriel Osvaldo 

## 🔗 Enlaces de Entrega (CE-01 y CE-07)

- **Repositorio Público de GitHub:** [https://github.com/Ozzetas/tpi-programacion4](https://github.com/Ozzetas/tpi-programacion4)
- **Video de Demostración (10 a 15 min):** [https://youtu.be/IMuKyOlHZEs](https://youtu.be/IMuKyOlHZEs)

---

## 🏗️ Arquitectura del Sistema

Aplicación web full-stack estructurada en dos proyectos independientes que se comunican por HTTP bajo el prefijo `/api/v1`:

- **Backend (`backend/`):** API REST construida con **FastAPI** y **SQLModel** sobre **PostgreSQL** (con soporte para **SQLite** en desarrollo local). Implementa una arquitectura en capas (`Router` → `Service` → `Unit of Work` → `Repository` → `Model`) donde el `commit` o `rollback` de las transacciones se ejecuta exclusivamente en el método `__exit__` del `UnitOfWork`.
- **Frontend (`frontend/`):** Aplicación **React 19** + **TypeScript (`strict: true`, sin `any`)** construida con **Vite 7** y estilada con **Tailwind CSS 4**. Organizada por *features* (`auth`, `categorias`, `productos`, `pedidos`, `usuarios`), gestiona el estado del servidor con **TanStack Query v5**, los formularios con **TanStack Form v1**, las tablas administrativas con **TanStack Table v8** y el estado global del cliente (sesión y carrito persistido) con **Zustand v5**.
- **Autenticación y Autorización:** Sesión gestionada mediante **JWT** enviado en una cookie `HttpOnly` (`access_token`) adjuntada automáticamente por el navegador (`withCredentials: true` en Axios). El frontend nunca lee ni almacena el token JWT.

---

## 📋 Requisitos Previos (CE-02)

| Tecnología | Versión Requerida | Rol / Observaciones |
| :--- | :--- | :--- |
| **Python** | `3.11` a `3.13` | Lenguaje del backend (`SQLModel 0.0.22` no funciona con Python `3.14`) |
| **PostgreSQL** | `15` o superior | Base de datos relacional (en desarrollo local se acepta `SQLite` cambiando `DATABASE_URL`) |
| **Node.js** | `20.19` o superior | Entorno de ejecución de las herramientas del frontend |
| **pnpm** | `9` o superior | Gestor de paquetes del frontend |

---

## ⚙️ Variables de Entorno (CE-03)

### 1. Backend (`backend/.env`)

Copiar el archivo `backend/.env.example` a `backend/.env`. Variables incluidas:

```ini
# Para producción/evaluación con PostgreSQL:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/foodstore_db
# Para desarrollo local rápido con SQLite:
DATABASE_URL=sqlite:///./foodstore.db
SECRET_KEY=cambiar-esta-clave-secreta-de-al-menos-32-caracteres-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173
```

### 2. Frontend (`frontend/.env`)

Copiar el archivo `frontend/.env.example` a `frontend/.env`. Variable incluida:

```ini
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🚀 Instalación y Ejecución del Backend (CE-04 y CE-05)

Abrir una terminal en la raíz del proyecto y ejecutar los siguientes comandos según el sistema operativo:

### En Windows (PowerShell)

```powershell
# 1. Entrar a la carpeta del backend
cd backend

# 2. Crear y activar el entorno virtual
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 3. Instalar las dependencias fijadas
pip install -r requirements.txt

# 4. Crear el archivo .env a partir de .env.example
Copy-Item .env.example .env

# 5. Ejecutar el seed idempotente (carga admin, categorías y productos con stock)
python -m app.db.seed

# 6. Iniciar el servidor de desarrollo FastAPI
uvicorn app.main:app --reload
```

### En Linux / macOS (Bash)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

- **URL base de la API:** `http://localhost:8000/api/v1`
- **Documentación interactiva Swagger UI:** `http://localhost:8000/docs`
- **Documentación ReDoc:** `http://localhost:8000/redoc`

---

## 💻 Instalación y Ejecución del Frontend (CE-06)

Abrir una **segunda terminal** en la raíz del proyecto y ejecutar:

### En Windows (PowerShell)

```powershell
# 1. Entrar a la carpeta del frontend
cd frontend

# 2. Crear el archivo .env a partir de .env.example
Copy-Item .env.example .env

# 3. Instalar dependencias con pnpm
pnpm install

# 4. Verificar tipos estrictos de TypeScript y compilación de producción
pnpm build

# 5. Iniciar el servidor de desarrollo de Vite
pnpm dev
```

### En Linux / macOS (Bash)

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm build
pnpm dev
```

- **Aplicación Web (Frontend):** `http://localhost:5173`

---

## 🔐 Usuario Administrador del Seed (CE-02 y CE-04)

El comando `python -m app.db.seed` es idempotente y crea automáticamente el usuario administrador inicial junto con 4 categorías y 9 productos con stock:

- **Usuario (`username`):** `admin`
- **Contraseña (`password`):** `Admin1234!`
- **Rol (`role`):** `admin`
- **Email:** `admin@foodstore.com`

Los clientes se registran desde la pantalla pública `/register` y reciben automáticamente el rol `user`.