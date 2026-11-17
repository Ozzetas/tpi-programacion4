import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { handleApiError } from "../../../shared/api/handleApiError";
import type { EstadoPedido, Pedido } from "../types";

const ESTADOS_FILTRO: Array<{ label: string; value?: EstadoPedido }> = [
  { label: "Todos", value: undefined },
  { label: "Pendientes", value: "PENDIENTE" },
  { label: "En preparación", value: "EN_PREPARACION" },
  { label: "Entregados", value: "ENTREGADO" },
  { label: "Cancelados", value: "CANCELADO" },
];

export function AdminPedidosPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | undefined>(
    undefined
  );
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: 0,
    limit: 100,
    estado: estadoFiltro,
  });

  const cambiarEstadoMutation = useCambiarEstadoPedido();

  const handleTransicion = async (
    pedidoId: number,
    nuevoEstado: EstadoPedido
  ): Promise<void> => {
    setActionError(null);
    try {
      await cambiarEstadoMutation.mutateAsync({
        id: pedidoId,
        payload: { estado: nuevoEstado },
      });
    } catch (err: unknown) {
      setActionError(handleApiError(err));
    }
  };

  const columns = useMemo<ColumnDef<Pedido>[]>(
    () => [
      {
        header: "Pedido",
        accessorKey: "id",
        cell: ({ row }) => (
          <div>
            <span className="font-bold text-slate-900">
              #{row.original.id}
            </span>
            <p className="text-xs text-slate-500">
              Usuario #{row.original.usuario_id}
            </p>
          </div>
        ),
      },
      {
        header: "Fecha",
        accessorKey: "created_at",
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {new Date(row.original.created_at).toLocaleString("es-AR", {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </span>
        ),
      },
      {
        header: "Entrega / Pago",
        accessorKey: "direccion_entrega",
        cell: ({ row }) => (
          <div>
            <p className="font-medium text-slate-800">
              {row.original.direccion_entrega}
            </p>
            <p className="text-xs text-slate-500">{row.original.forma_pago}</p>
          </div>
        ),
      },
      {
        header: "Total",
        accessorKey: "total",
        cell: ({ row }) => (
          <span className="font-bold text-orange-600">
            ${row.original.total.toLocaleString("es-AR")}
          </span>
        ),
      },
      {
        header: "Estado",
        accessorKey: "estado",
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      {
        id: "acciones",
        header: "Acciones y Transiciones (RN-02)",
        cell: ({ row }) => {
          const p = row.original;
          const procesandoEstePedido =
            cambiarEstadoMutation.isPending &&
            cambiarEstadoMutation.variables?.id === p.id;

          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPedidoDetalle(p)}
              >
                Detalle ({p.items.length})
              </Button>

              {p.estado === "PENDIENTE" && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={procesandoEstePedido}
                    onClick={() =>
                      void handleTransicion(p.id, "EN_PREPARACION")
                    }
                  >
                    A preparación
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={procesandoEstePedido}
                    onClick={() => void handleTransicion(p.id, "CANCELADO")}
                  >
                    Cancelar
                  </Button>
                </>
              )}

              {p.estado === "EN_PREPARACION" && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={procesandoEstePedido}
                    onClick={() => void handleTransicion(p.id, "ENTREGADO")}
                  >
                    Marcar entregado
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={procesandoEstePedido}
                    onClick={() => void handleTransicion(p.id, "CANCELADO")}
                  >
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [cambiarEstadoMutation.isPending, cambiarEstadoMutation.variables]
  );

  const tableData = useMemo(() => data?.items ?? [], [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Gestión de Pedidos
          </h1>
          <p className="text-sm text-slate-600">
            Avanza o cancela los pedidos de los clientes según la máquina de
            estados
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ESTADOS_FILTRO.map((filtro) => (
            <Button
              key={filtro.label}
              variant={estadoFiltro === filtro.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setEstadoFiltro(filtro.value)}
            >
              {filtro.label}
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
        <Skeleton cantidad={4} className="h-24" />
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : tableData.length === 0 ? (
        <EstadoVacio
          titulo="No hay pedidos registrados"
          descripcion="No existen órdenes para el estado seleccionado."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-600">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3.5">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-xs text-slate-600">
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {Math.max(1, table.getPageCount())} ({tableData.length} pedidos)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      )}

      <PedidoDetalleModal
        pedido={pedidoDetalle}
        onClose={() => setPedidoDetalle(null)}
      />
    </div>
  );
}