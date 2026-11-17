import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { useForm } from "@tanstack/react-form";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategorias";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import type { Categoria } from "../types";

export function AdminCategoriasPage() {
  const { data: categorias, isLoading, isError, error, refetch } =
    useCategorias();
  const crearMutation = useCrearCategoria();
  const actualizarMutation = useActualizarCategoria();
  const eliminarMutation = useEliminarCategoria();

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(
    null
  );
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: categoriaEditando?.nombre ?? "",
      descripcion: categoriaEditando?.descripcion ?? "",
    },
    onSubmit: async ({ value }) => {
      setFeedbackError(null);
      const payload = {
        nombre: value.nombre.trim(),
        descripcion:
          value.descripcion.trim().length > 0 ? value.descripcion.trim() : null,
      };

      try {
        if (categoriaEditando) {
          await actualizarMutation.mutateAsync({
            id: categoriaEditando.id,
            payload,
          });
        } else {
          await crearMutation.mutateAsync(payload);
        }
        cerrarModal();
      } catch (err: unknown) {
        setFeedbackError(handleApiError(err));
      }
    },
  });

  const abrirModalCrear = (): void => {
    setCategoriaEditando(null);
    setFeedbackError(null);
    form.reset();
    form.setFieldValue("nombre", "");
    form.setFieldValue("descripcion", "");
    setModalAbierto(true);
  };

  const abrirModalEditar = (cat: Categoria): void => {
    setCategoriaEditando(cat);
    setFeedbackError(null);
    form.reset();
    form.setFieldValue("nombre", cat.nombre);
    form.setFieldValue("descripcion", cat.descripcion ?? "");
    setModalAbierto(true);
  };

  const cerrarModal = (): void => {
    setModalAbierto(false);
    setCategoriaEditando(null);
    setFeedbackError(null);
  };

  const handleEliminar = async (cat: Categoria): Promise<void> => {
    setFeedbackError(null);
    try {
      await eliminarMutation.mutateAsync(cat.id);
    } catch (err: unknown) {
      setFeedbackError(handleApiError(err));
    }
  };

  const columns = useMemo<ColumnDef<Categoria>[]>(
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
        header: "Nombre",
        accessorKey: "nombre",
        cell: ({ row }) => (
          <span className="font-semibold text-slate-900">
            {row.original.nombre}
          </span>
        ),
      },
      {
        header: "Descripción",
        accessorKey: "descripcion",
        cell: ({ row }) => (
          <span className="text-slate-600">
            {row.original.descripcion ?? "Sin descripción"}
          </span>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => abrirModalEditar(cat)}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={
                  eliminarMutation.isPending &&
                  eliminarMutation.variables === cat.id
                }
                onClick={() => void handleEliminar(cat)}
              >
                Dar de baja
              </Button>
            </div>
          );
        },
      },
    ],
    [eliminarMutation.isPending, eliminarMutation.variables]
  );

  const tableData = useMemo(() => categorias ?? [], [categorias]);

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
            Administración de Categorías
          </h1>
          <p className="text-sm text-slate-600">
            Crea, modifica o realiza la baja lógica de categorías del catálogo
          </p>
        </div>
        <Button variant="primary" onClick={abrirModalCrear}>
          + Nueva categoría
        </Button>
      </div>

      {feedbackError && !modalAbierto && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {feedbackError}
        </div>
      )}

      {isLoading ? (
        <Skeleton cantidad={3} className="h-20" />
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : tableData.length === 0 ? (
        <EstadoVacio
          titulo="No hay categorías activas"
          descripcion="Crea la primera categoría para clasificar los productos del menú."
          accion={
            <Button variant="primary" onClick={abrirModalCrear}>
              Crear categoría
            </Button>
          }
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
              {Math.max(1, table.getPageCount())} ({tableData.length} categorías)
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

      <Modal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        title={
          categoriaEditando
            ? `Editar Categoría #${categoriaEditando.id}`
            : "Nueva Categoría"
        }
      >
        {feedbackError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {feedbackError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => {
                const limpio = value.trim();
                if (limpio.length < 2 || limpio.length > 100) {
                  return "El nombre debe tener entre 2 y 100 caracteres";
                }
                return undefined;
              },
            }}
            children={(field) => {
              const errorMsg =
                field.state.meta.errors.length > 0
                  ? field.state.meta.errors.map((err) => String(err)).join(", ")
                  : undefined;

              return (
                <Input
                  id={field.name}
                  name={field.name}
                  label="Nombre de la categoría *"
                  placeholder="Ej: Postres"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorMsg}
                />
              );
            }}
          />

          <form.Field
            name="descripcion"
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-slate-700"
                >
                  Descripción
                </label>
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={3}
                  placeholder="Descripción breve de la categoría..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={
                crearMutation.isPending || actualizarMutation.isPending
              }
            >
              {categoriaEditando ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}