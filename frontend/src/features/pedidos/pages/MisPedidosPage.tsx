import { useState } from "react";
import { Link } from "react-router-dom";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { EstadoError } from "../../../shared/components/EstadoError";
import { handleApiError } from "../../../shared/api/handleApiError";
import type { EstadoPedido, Pedido } from "../types";

const PAGE_LIMIT = 10;

const ESTADOS_FILTRO: Array<{ label: string; value?: EstadoPedido }> = [
  { label: "Todos", value: undefined },
  { label: "Pendientes", value: "PENDIENTE" },
  { label: "En preparación", value: "EN_PREPARACION" },
  { label: "Entregados", value: "ENTREGADO" },
  { label: "Cancelados", value: "CANCELADO" },
];

export function MisPedidosPage() {
  const [skip, setSkip] = useState<number>(0);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | undefined>(
    undefined
  );
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip,
    limit: PAGE_LIMIT,
    estado: estadoFiltro,
  });

  const cancelarMutation = useCancelarPedido();

  const handleCancelar = async (pedidoId: number): Promise<void> => {
    setActionError(null);
    try {
      await cancelarMutation.mutateAsync(pedidoId);
    } catch (err: unknown) {
      setActionError(handleApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis Pedidos</h1>
          <p className="text-sm text-slate-600">
            Consulta el estado de tus compras o cancela pedidos pendientes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ESTADOS_FILTRO.map((item) => (
            <Button
              key={item.label}
              variant={estadoFiltro === item.value ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                setEstadoFiltro(item.value);
                setSkip(0);
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <Skeleton cantidad={3} className="h-36" />
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron pedidos"
          descripcion="Aún no has realizado pedidos con el filtro seleccionado."
          accion={
            <Link to="/">
              <Button variant="primary">Ir al catálogo</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {data.items.map((pedido) => {
              const fecha = new Date(pedido.created_at).toLocaleString(
                "es-AR",
                {
                  dateStyle: "short",
                  timeStyle: "short",
                }
              );

              return (
                <Card
                  key={pedido.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-slate-900">
                        Pedido #{pedido.id}
                      </span>
                      <BadgeEstado estado={pedido.estado} />
                      <span className="text-xs text-slate-500">{fecha}</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Entrega en:{" "}
                      <span className="font-medium text-slate-800">
                        {pedido.direccion_entrega}
                      </span>{" "}
                      ({pedido.forma_pago})
                    </p>
                    <p className="text-xs text-slate-500">
                      {pedido.items.length}{" "}
                      {pedido.items.length === 1 ? "producto" : "productos"} —{" "}
                      {pedido.items
                        .map((i) => `${i.cantidad}x ${i.nombre_producto}`)
                        .join(", ")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                    <div className="text-right sm:mr-2">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-lg font-extrabold text-orange-600">
                        ${pedido.total.toLocaleString("es-AR")}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      Ver detalle
                    </Button>

                    {/* RN-04: el cliente solo puede cancelar sus pedidos cuando están en estado PENDIENTE */}
                    {pedido.estado === "PENDIENTE" && (
                      <Button
                        variant="danger"
                        size="sm"
                        isLoading={
                          cancelarMutation.isPending &&
                          cancelarMutation.variables === pedido.id
                        }
                        onClick={() => void handleCancelar(pedido.id)}
                      >
                        Cancelar pedido
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <Paginacion
            skip={skip}
            limit={PAGE_LIMIT}
            total={data.total}
            onPageChange={(nuevoSkip) => setSkip(nuevoSkip)}
          />
        </>
      )}

      <PedidoDetalleModal
        pedido={pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
      />
    </div>
  );
}