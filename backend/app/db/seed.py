# pyright: reportUnknownVariableType=false, reportUnknownMemberType=false, reportUnknownArgumentType=false
import logging
from sqlmodel import select

from app.core.database import create_all_tables, session_factory
from app.core.security import get_password_hash
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_seed() -> None:
    """Inicializa el esquema y carga de forma idempotente el admin, categorías y productos iniciales."""
    create_all_tables()

    with session_factory() as session:
        # 1. Usuario Administrador exigido por el enunciado (admin / Admin1234!)
        admin_existente = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()
        if admin_existente is None:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            logger.info("Usuario administrador 'admin' creado.")
        else:
            logger.info("El usuario 'admin' ya existe; se omite su creación.")

        # 2. Categorías iniciales (al menos 3 categorías requeridas)
        categorias_seed = [
            {
                "nombre": "Hamburguesas",
                "descripcion": "Hamburguesas artesanales de carne seleccionada en pan brioche.",
            },
            {
                "nombre": "Pizzas",
                "descripcion": "Pizzas a la piedra de fermentación lenta con muzzarella de primera calidad.",
            },
            {
                "nombre": "Empanadas",
                "descripcion": "Empanadas caseras horneadas y fritas con rellenos tradicionales.",
            },
            {
                "nombre": "Bebidas",
                "descripcion": "Gaseosas, aguas saborizadas y limonadas naturales bien frías.",
            },
        ]

        mapa_categorias: dict[str, int] = {}
        for cat_data in categorias_seed:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == cat_data["nombre"])
            ).first()
            if cat is None:
                cat = Categoria(
                    nombre=cat_data["nombre"],
                    descripcion=cat_data["descripcion"],
                    activo=True,
                )
                session.add(cat)
                session.flush()
                session.refresh(cat)
                logger.info("Categoría creada: %s", cat.nombre)
            assert cat.id is not None
            mapa_categorias[cat.nombre] = cat.id

        # 3. Productos iniciales (al menos 8 productos con stock requeridos)
        productos_seed = [
            {
                "nombre": "Hamburguesa Doble Cheddar y Panceta",
                "descripcion": "Doble medallón smash de 120g, cuádruple cheddar, panceta crocante y salsa especial.",
                "precio_base": 9500.0,
                "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
                "stock": 25,
                "categoria": "Hamburguesas",
            },
            {
                "nombre": "Hamburguesa Clásica Americana",
                "descripcion": "Medallón de 150g, queso tybo, lechuga capuchina, tomate fresco, cebolla morada y pepinillos.",
                "precio_base": 8200.0,
                "imagen_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
                "stock": 20,
                "categoria": "Hamburguesas",
            },
            {
                "nombre": "Pizza Muzzarella Clásica",
                "descripcion": "Salsa de tomates italianos, abundante muzzarella, orégano orgánico y aceitunas verdes.",
                "precio_base": 11000.0,
                "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
                "stock": 18,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Pizza Napolitana con Ajo",
                "descripcion": "Muzzarella, rodajas de tomate natural, albahaca fresca, toque de ajo y aceite de oliva.",
                "precio_base": 12500.0,
                "imagen_url": "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=800&q=80",
                "stock": 15,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Pizza Especial de Jamón y Morrones",
                "descripcion": "Muzzarella, jamón cocido natural horneado, morrones asados y aceitunas.",
                "precio_base": 13200.0,
                "imagen_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
                "stock": 12,
                "categoria": "Pizzas",
            },
            {
                "nombre": "Docena de Empanadas Criollas Cortadas a Cuchillo",
                "descripcion": "12 empanadas de carne vacuna cortada a cuchillo, cebolla de verdeo, huevo y comino.",
                "precio_base": 14000.0,
                "imagen_url": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
                "stock": 15,
                "categoria": "Empanadas",
            },
            {
                "nombre": "Media Docena de Empanadas Jamón y Queso",
                "descripcion": "6 empanadas horneadas rellenas con abundante muzzarella y jamón cocido.",
                "precio_base": 7500.0,
                "imagen_url": "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80",
                "stock": 20,
                "categoria": "Empanadas",
            },
            {
                "nombre": "Limonada Casera con Menta y Jengibre 1L",
                "descripcion": "Jugo de limones recién exprimidos, hojas de menta fresca, jengibre y azúcar orgánica.",
                "precio_base": 4200.0,
                "imagen_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
                "stock": 30,
                "categoria": "Bebidas",
            },
            {
                "nombre": "Gaseosa Línea Cola 1.5L",
                "descripcion": "Botella familiar ideal para compartir.",
                "precio_base": 3800.0,
                "imagen_url": "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80",
                "stock": 40,
                "categoria": "Bebidas",
            },
        ]

        for prod_data in productos_seed:
            nombre_prod = str(prod_data["nombre"])
            prod_existente = session.exec(
                select(Producto).where(Producto.nombre == nombre_prod)
            ).first()
            if prod_existente is None:
                nuevo_prod = Producto(
                    nombre=nombre_prod,
                    descripcion=str(prod_data["descripcion"]),
                    precio_base=float(str(prod_data["precio_base"])),
                    imagen_url=str(prod_data["imagen_url"]),
                    stock=int(str(prod_data["stock"])),
                    disponible=True,
                    activo=True,
                    categoria_id=mapa_categorias[str(prod_data["categoria"])],
                )
                session.add(nuevo_prod)
                logger.info("Producto creado: %s", nuevo_prod.nombre)

        session.commit()
        logger.info("Seed ejecutado correctamente de forma idempotente.")


if __name__ == "__main__":
    run_seed()