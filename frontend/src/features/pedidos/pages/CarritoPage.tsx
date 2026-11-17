import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../../store/cartStore";
import { useAuthStore } from "../../../store/authStore";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";

export function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);
  const vaciar = useCartStore((state) => state.vaciar);
  const totalCarrito = useCartStore((state) => state.total());
  const usuario = useAuthStore((state) => state.usuario);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="py-8">
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Agrega productos desde el catálogo para armar tu pedido."
          accion={
            <Link to="/">
              <Button variant="primary">Ir al catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleContinuarCompra = (): void => {
    if (!usuario) {
      void navigate("/login");
      return;
    }
    void navigate("/checkout");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Carrito de Compras
          </h1>
          <p className="text-sm text-slate-600">
            Revisa las cantidades antes de confirmar tu pedido
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={vaciar}>
          Vaciar carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const subtotal =
              Math.round(item.precio_unitario * item.cantidad * 100) / 100;
            const enTopeStock =
              item.stock_maximo !== undefined &&
              item.cantidad >= item.stock_maximo;

            return (
              <Card
                key={item.producto_id}
                className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex items-center gap-4">
                  {item.imagen_url ? (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre}
                      className="h-16 w-16 rounded-lg object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                      Sin foto
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {item.nombre}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Precio unitario: $
                      {item.precio_unitario.toLocaleString("es-AR")}
                    </p>
                    {item.stock_maximo !== undefined && (
                      <p className="text-xs text-slate-400">
                        Stock disponible: {item.stock_maximo}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center rounded-lg border border-slate-300 bg-white">
                    <button
                      type="button"
                      onClick={() =>
                        cambiarCantidad(item.producto_id, item.cantidad - 1)
                      }
                      className="px-3 py-1 text-slate-700 hover:bg-slate-100 rounded-l-lg cursor-pointer"
                      aria-label="Disminuir cantidad"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-slate-900">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      disabled={enTopeStock}
                      onClick={() =>
                        cambiarCantidad(item.producto_id, item.cantidad + 1)
                      }
                      className="px-3 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-r-lg cursor-pointer"
                      aria-label="Aumentar cantidad"
                    >
                      +
                    </button>
                  </div>

                  <div className="min-w-24 text-right">
                    <p className="text-xs text-slate-500">Subtotal</p>
                    <p className="font-bold text-slate-900">
                      ${subtotal.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => quitar(item.producto_id)}
                  >
                    Quitar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        <div>
          <Card className="sticky top-24 space-y-4 p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Resumen de compra
            </h2>
            <div className="space-y-2 border-b border-slate-200 pb-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Productos distintos</span>
                <span className="font-medium text-slate-900">
                  {items.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Unidades totales</span>
                <span className="font-medium text-slate-900">
                  {items.reduce((acc, i) => acc + i.cantidad, 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-lg font-extrabold text-slate-900">
              <span>Total</span>
              <span className="text-orange-600">
                ${totalCarrito.toLocaleString("es-AR")}
              </span>
            </div>

            <Button
              variant="primary"
              className="w-full"
              onClick={handleContinuarCompra}
            >
              {usuario
                ? "Continuar al checkout"
                : "Iniciar sesión para confirmar"}
            </Button>

            <Link
              to="/"
              className="block text-center text-xs font-medium text-slate-500 hover:text-orange-600"
            >
              ← Seguir agregando productos
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}