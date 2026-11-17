import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { Button } from "../ui/Button";

export function Navbar() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const itemsCarrito = useCartStore((state) => state.items);
  const navigate = useNavigate();

  const cantidadTotalCarrito = itemsCarrito.reduce(
    (acc, item) => acc + item.cantidad,
    0
  );

  const handleLogout = async (): Promise<void> => {
    await logout();
    void navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight text-orange-600"
          >
            Food Store
          </Link>

          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-orange-600">
              Catálogo
            </Link>
            <Link
              to="/carrito"
              className="inline-flex items-center gap-1.5 hover:text-orange-600"
            >
              <span>Carrito</span>
              {cantidadTotalCarrito > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1.5 text-xs font-bold text-white">
                  {cantidadTotalCarrito}
                </span>
              )}
            </Link>
            {usuario && (
              <Link to="/mis-pedidos" className="hover:text-orange-600">
                Mis pedidos
              </Link>
            )}
            {usuario?.role === "admin" && (
              <div className="flex flex-wrap items-center gap-3 border-l border-slate-200 pl-4 text-slate-700">
                <Link
                  to="/admin/resumen"
                  className="font-semibold text-orange-700 hover:text-orange-800"
                >
                  Resumen
                </Link>
                <Link to="/admin/categorias" className="hover:text-orange-600">
                  Categorías
                </Link>
                <Link to="/admin/productos" className="hover:text-orange-600">
                  Productos
                </Link>
                <Link to="/admin/pedidos" className="hover:text-orange-600">
                  Pedidos
                </Link>
                <Link to="/admin/usuarios" className="hover:text-orange-600">
                  Usuarios
                </Link>
              </div>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="text-right text-xs sm:text-sm">
                <p className="font-semibold text-slate-900">
                  {usuario.full_name}
                </p>
                <p className="text-xs text-slate-500 uppercase">
                  Rol: {usuario.role}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => void handleLogout()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}