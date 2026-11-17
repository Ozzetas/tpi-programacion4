import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useCartStore } from "../../../store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import type { FormaPago } from "../types";

export function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const totalCarrito = useCartStore((state) => state.total());
  const vaciarCarrito = useCartStore((state) => state.vaciar);
  const crearPedidoMutation = useCrearPedido();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await crearPedidoMutation.mutateAsync({
          items: items.map((item) => ({
            producto_id: item.producto_id,
            cantidad: item.cantidad,
          })),
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim().length > 0 ? value.notas.trim() : null,
        });

        // Al confirmarse la transacción en el backend, vacío el carrito persistido y redirijo a Mis Pedidos
        vaciarCarrito();
        void navigate("/mis-pedidos");
      } catch (error: unknown) {
        setServerError(handleApiError(error));
      }
    },
  });

  if (items.length === 0) {
    return (
      <div className="py-8">
        <EstadoVacio
          titulo="No tienes productos en el carrito"
          descripcion="Agrega al menos un producto antes de pasar por el checkout."
          accion={
            <Link to="/">
              <Button variant="primary">Explorar catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Confirmar Pedido</h1>
        <p className="text-sm text-slate-600">
          Completa los datos de entrega y forma de pago para procesar tu compra
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
        <Card className="p-6 md:col-span-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="space-y-5"
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) => {
                  const limpio = value.trim();
                  if (limpio.length < 5) {
                    return "La dirección de entrega debe tener al menos 5 caracteres (RN-06)";
                  }
                  if (limpio.length > 200) {
                    return "La dirección de entrega no puede superar los 200 caracteres (RN-06)";
                  }
                  return undefined;
                },
              }}
              children={(field) => {
                const errorMsg =
                  field.state.meta.errors.length > 0
                    ? field.state.meta.errors
                        .map((err) => String(err))
                        .join(", ")
                    : undefined;

                return (
                  <Input
                    id={field.name}
                    name={field.name}
                    label="Dirección de entrega *"
                    placeholder="Ej: Av. Vélez Sarsfield 1250, Piso 4 Dpto B"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={errorMsg}
                  />
                );
              }}
            />

            <form.Field
              name="forma_pago"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-slate-700"
                  >
                    Forma de pago *
                  </label>
                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as FormaPago)
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    <option value="EFECTIVO">Efectivo al recibir</option>
                    <option value="TRANSFERENCIA">
                      Transferencia bancaria
                    </option>
                  </select>
                </div>
              )}
            />

            <form.Field
              name="notas"
              children={(field) => (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={field.name}
                    className="text-sm font-medium text-slate-700"
                  >
                    Notas para el pedido (opcional)
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={3}
                    placeholder="Ej: El timbre no funciona, llamar al llegar..."
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              )}
            />

            <div className="flex items-center justify-between gap-3 pt-2">
              <Link to="/carrito">
                <Button type="button" variant="outline">
                  Volver al carrito
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                isLoading={crearPedidoMutation.isPending}
              >
                Confirmar pedido (${totalCarrito.toLocaleString("es-AR")})
              </Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit space-y-4 p-6 md:col-span-2">
          <h2 className="text-base font-bold text-slate-900">
            Detalle de tu carrito
          </h2>
          <div className="divide-y divide-slate-100 text-sm">
            {items.map((item) => (
              <div
                key={item.producto_id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.nombre}</p>
                  <p className="text-xs text-slate-500">
                    {item.cantidad} x $
                    {item.precio_unitario.toLocaleString("es-AR")}
                  </p>
                </div>
                <span className="font-semibold text-slate-900">
                  $
                  {(item.precio_unitario * item.cantidad).toLocaleString(
                    "es-AR"
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
            <span>Total a pagar</span>
            <span className="text-orange-600">
              ${totalCarrito.toLocaleString("es-AR")}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}