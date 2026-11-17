# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador de la asignatura **Programación IV** — **Tecnicatura Universitaria en Programación a Distancia (UTN)**.

## 🔗 Enlaces de Entrega (CE-01 y CE-07)

- **Repositorio Público de GitHub:** `<https://github.com/Ozzetas/tpi-programacion4.git>`
- **Video de Demostración (10 a 15 min):** `<URL_PUBLICA_DEL_VIDEO_DEMO>`

---

## 🏗️ Arquitectura del Sistema

Aplicación web full-stack estructurada en dos proyectos independientes comunicados vía HTTP bajo el prefijo `/api/v1`:

- **Backend (`backend/`):** API REST construida con **FastAPI** y **SQLModel** sobre **PostgreSQL** (con soporte para **SQLite** en desarrollo local). Implementa una arquitectura en capas estricta (`Router` → `Service` → `Unit of Work` → `Repository` → `Model`) donde las transacciones se confirman o revierten de forma atómica exclusivamente en el método `__exit__` del `UnitOfWork`.
- **Frontend (`frontend/`):** SPA desarrollada con **React 19**, **TypeScript (`strict: true`, sin `any`)**, **Vite 7** y **Tailwind CSS 4**. Organizada por *features* (`auth`, `categorias`, `productos`, `pedidos`, `usuarios`), gestionando el estado del servidor mediante **TanStack Query v5**, formularios con **TanStack Form v1**, tablas administrativas con **TanStack Table v8** y estado del cliente (sesión y carrito persistido) con **Zustand v5**.
- **Seguridad y Sesión:** Autenticación mediante **JWT** almacenado exclusivamente en una cookie `HttpOnly` (`access_token`) adjuntada por el navegador mediante Axios (`withCredentials: true`). El frontend nunca lee ni almacena el token JWT.

---

## 📋 Requisitos Previos (CE-02)

| Componente | Versión Requerida | Notas |
| :--- | :--- | :--- |
| **Python** | `3.11` a `3.13` | `SQLModel 0.0.22` no es compatible con Python `3.14` |
| **PostgreSQL** | `15` o superior | Opcional en desarrollo local si se utiliza `SQLite` en `DATABASE_URL` |
| **Node.js** | `20.19` o superior | Entorno de ejecución para Vite 7 y React 19 |
| **pnpm** | `9` o superior | Gestor de paquetes del frontend |

---

## ⚙️ Variables de Entorno (CE-03)

### Backend (`backend/.env`)

Copiar el archivo `backend/.env.example` a `backend/.env`. Variables requeridas:

```ini
# Conexión PostgreSQL (Producción / Evaluación):
# DATABASE_URL=postgresql://user:pass@localhost:5432/foodstore_db
# Conexión SQLite (Desarrollo local rápido):
DATABASE_URL=sqlite:///./foodstore.db
SECRET_KEY=cambiar-esta-clave-secreta-de-al-menos-32-caracteres-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_ORIGIN=http://localhost:5173