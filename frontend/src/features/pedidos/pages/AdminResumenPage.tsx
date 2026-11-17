import { Link } from "react-router-dom";
import { useResumenPedidos } from "../hooks/usePedidos";
import { ResumenCard } from "../components/ResumenCard";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EstadoError } from "../../../shared/components/EstadoError";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Button } from "../../../shared/ui/Button";

export function AdminResumenPage() {
  const { data: resumen, isLoading, isError, error, refetch } =
    useResumenPedidos();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Resumen del Negocio
          </h1>
          <p className="text-sm text-slate-600">
            Indicadores operativos de pedidos e ingresos en tiempo real
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link to="/admin/pedidos">
            <Button variant="primary" size="sm">
              Gestionar pedidos
            </Button>
          </Link>
          <Link to="/admin/productos">
            <Button variant="outline" size="sm">
              Productos y stock
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <Skeleton cantidad={6} className="h-32" />
      ) : isError || !resumen ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard
            titulo="Pedidos de Hoy"
            valor={resumen.pedidos_hoy}
            subtitulo="Órdenes registradas desde las 00:00 UTC"
            colorClase="text-orange-600"
          />
          <ResumenCard
            titulo="Ingresos Entregados"
            valor={`$${resumen.ingresos_entregados.toLocaleString("es-AR")}`}
            subtitulo="Facturación consolidada de pedidos en estado ENTREGADO"
            colorClase="text-emerald-600"
          />
          <ResumenCard
            titulo="Pedidos Pendientes"
            valor={resumen.pendientes}
            subtitulo="Aguardando confirmación y preparación"
            colorClase="text-amber-600"
          />
          <ResumenCard
            titulo="En Preparación"
            valor={resumen.en_preparacion}
            subtitulo="Actualmente en cocina"
            colorClase="text-blue-600"
          />
          <ResumenCard
            titulo="Pedidos Entregados"
            valor={resumen.entregados}
            subtitulo="Órdenes completadas satisfactoriamente"
            colorClase="text-emerald-700"
          />
          <ResumenCard
            titulo="Pedidos Cancelados"
            valor={resumen.cancelados}
            subtitulo="Órdenes dadas de baja con stock restituido"
            colorClase="text-red-600"
          />
        </div>
      )}
    </div>
  );
}