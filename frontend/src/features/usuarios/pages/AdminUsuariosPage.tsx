import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from "../hooks/useUsuarios";
import { useAuthStore } from "../../../store/authStore";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import type { Usuario } from "../types";

export function AdminUsuariosPage() {
  const usuarioSesion = useAuthStore((state) => state.usuario);
  const { data: usuarios, isLoading, isError, error, refetch } = useUsuarios();
  const activarMutation = useActivarUsuario();
  const desactivarMutation = useDesactivarUsuario();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleActivar = async (id: number): Promise<void> => {
    setActionError(null);
    try {
      await activarMutation.mutateAsync(id);
    } catch (err: unknown) {
      setActionError(handleApiError(err));
    }
  };

  const handleDesactivar = async (id: number): Promise<void> => {
    setActionError(null);
    try {
      await desactivarMutation.mutateAsync(id);
    } catch (err: unknown) {
      setActionError(handleApiError(err));
    }
  };

  const columns = useMemo<ColumnDef<Usuario>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-500">
            #{row.original.id}
          </span>
        ),
      },
      {
        header: "Usuario",
        accessorKey: "username",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">
            {row.original.username}
          </span>
        ),
      },
      {
        header: "Nombre completo",
        accessorKey: "full_name",
      },
      {
        header: "Email",
        accessorKey: "email",
      },
      {
        header: "Rol",
        accessorKey: "role",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
              row.original.role === "admin"
                ? "bg-purple-100 text-purple-800"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {row.original.role}
          </span>
        ),
      },
      {
        header: "Estado",
        accessorKey: "disabled",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              row.original.disabled
                ? "bg-red-100 text-red-800"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {row.original.disabled ? "Desactivado" : "Activo"}
          </span>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          const esUsuarioActual = usuarioSesion?.id === u.id;

          // Omito el botón Desactivar en la fila del propio administrador autenticado según la especificación
          if (esUsuarioActual) {
            return (
              <span className="text-xs italic text-slate-400">
                Sesión actual
              </span>
            );
          }

          if (u.disabled) {
            return (
              <Button
                variant="primary"
                size="sm"
                isLoading={
                  activarMutation.isPending &&
                  activarMutation.variables === u.id
                }
                onClick={() => void handleActivar(u.id)}
              >
                Activar
              </Button>
            );
          }

          return (
            <Button
              variant="danger"
              size="sm"
              isLoading={
                desactivarMutation.isPending &&
                desactivarMutation.variables === u.id
              }
              onClick={() => void handleDesactivar(u.id)}
            >
              Desactivar
            </Button>
          );
        },
      },
    ],
    [
      usuarioSesion?.id,
      activarMutation.isPending,
      activarMutation.variables,
      desactivarMutation.isPending,
      desactivarMutation.variables,
    ]
  );

  const tableData = useMemo(() => usuarios ?? [], [usuarios]);

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
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Gestión de Usuarios
        </h1>
        <p className="text-sm text-slate-600">
          Administra el alta y la baja lógica de las cuentas registradas en el
          sistema
        </p>
      </div>

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <Skeleton cantidad={3} className="h-24" />
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : tableData.length === 0 ? (
        <EstadoVacio
          titulo="No hay usuarios registrados"
          descripcion="No se encontraron cuentas de usuario en el servidor."
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
                      <td key={cell.id} className="px-4 py-3 text-slate-700">
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
              {Math.max(1, table.getPageCount())} ({tableData.length} usuarios)
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
    </div>
  );
}