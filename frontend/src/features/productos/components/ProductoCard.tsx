import { useCartStore } from "../../../store/cartStore";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import type { Producto } from "../types";

interface ProductoCardProps {
  producto: Producto;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregarAlCarrito = useCartStore((state) => state.agregar);
  const itemsCarrito = useCartStore((state) => state.items);

  const itemEnCarrito = itemsCarrito.find(
    (item) => item.producto_id === producto.id
  );
  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0;

  const sinStock = producto.stock <= 0;
  const topeAlcanzado = cantidadEnCarrito >= producto.stock;
  const puedeComprar = producto.disponible && !sinStock && !topeAlcanzado;

  const handleAgregar = (): void => {
    if (!puedeComprar) return;
    agregarAlCarrito({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      cantidad: 1,
      stock_maximo: producto.stock,
      imagen_url: producto.imagen_url,
    });
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-48 w-full bg-slate-100">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Sin imagen
          </div>
        )}
        {producto.categoria && (
          <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xs">
            {producto.categoria.nombre}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900">
              {producto.nombre}
            </h3>
            <span className="shrink-0 text-lg font-extrabold text-orange-600">
              ${producto.precio_base.toLocaleString("es-AR")}
            </span>
          </div>

          {producto.descripcion && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {producto.descripcion}
            </p>
          )}
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between text-xs">
            <span
              className={`font-semibold ${
                producto.disponible && !sinStock
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {!producto.disponible
                ? "No disponible"
                : sinStock
                ? "Agotado"
                : `Stock disponible: ${producto.stock}`}
            </span>
            {cantidadEnCarrito > 0 && (
              <span className="rounded-md bg-orange-50 px-2 py-0.5 font-semibold text-orange-700">
                En carrito: {cantidadEnCarrito}
              </span>
            )}
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={!puedeComprar}
            onClick={handleAgregar}
          >
            {!producto.disponible
              ? "No disponible"
              : sinStock
              ? "Sin stock"
              : topeAlcanzado
              ? "Stock máximo en carrito"
              : "Agregar al carrito"}
          </Button>
        </div>
      </div>
    </Card>
  );
}