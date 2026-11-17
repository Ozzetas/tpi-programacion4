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
  useActualizarProducto,
  useActualizarStockProducto,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "../hooks/useProductos";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";
import { Input } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import type { Producto } from "../types";

export function AdminProductosPage() {
  // Pido limit=100 según la especificación para paginar del lado del cliente con TanStack Table
  const {
    data: productosPaginados,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductos({ skip: 0, limit: 100 });
  const { data: categorias } = useCategorias();

  const crearMutation = useCrearProducto();
  const actualizarMutation = useActualizarProducto();
  const stockMutation = useActualizarStockProducto();
  const eliminarMutation = useEliminarProducto();

  const [modalFormAbierto, setModalFormAbierto] = useState<boolean>(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(
    null
  );

  const [modalStockAbierto, setModalStockAbierto] = useState<boolean>(false);
  const [productoStock, setProductoStock] = useState<Producto | null>(null);

  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const formProducto = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio_base: "0",
      imagen_url: "",
      stock: "0",
      disponible: true,
      categoria_id: 0,
    },
    onSubmit: async ({ value }) => {
      setFeedbackError(null);
      const precioNum = Number(value.precio_base);
      const stockNum = Number(value.stock);

      if (Number.isNaN(precioNum) || precioNum < 0) {
        setFeedbackError("El precio base debe ser un número mayor o igual a 0");
        return;
      }
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        setFeedbackError("El stock debe ser un entero mayor o igual a 0");
        return;
      }
      if (!value.categoria_id || value.categoria_id <= 0) {
        setFeedbackError("Selecciona una categoría válida");
        return;
      }

      const payload = {
        nombre: value.nombre.trim(),
        descripcion:
          value.descripcion.trim().length > 0 ? value.descripcion.trim() : null,
        precio_base: precioNum,
        imagen_url:
          value.imagen_url.trim().length > 0 ? value.imagen_url.trim() : null,
        stock: stockNum,
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      };

      try {
        if (productoEditando) {
          await actualizarMutation.mutateAsync({
            id: productoEditando.id,
            payload,
          });
        } else {
          await crearMutation.mutateAsync(payload);
        }
        setModalFormAbierto(false);
        setProductoEditando(null);
      } catch (err: unknown) {
        setFeedbackError(handleApiError(err));
      }
    },
  });

  const formStock = useForm({
    defaultValues: {
      stock: "0",
      disponible: true,
    },
    onSubmit: async ({ value }) => {
      if (!productoStock) return;
      setFeedbackError(null);
      const stockNum = Number(value.stock);
      if (!Number.isInteger(stockNum) || stockNum < 0) {
        setFeedbackError("El stock debe ser un número entero mayor o igual a 0");
        return;
      }

      try {
        await stockMutation.mutateAsync({
          id: productoStock.id,
          payload: {
            stock: stockNum,
            disponible: value.disponible,
          },
        });
        setModalStockAbierto(false);
        setProductoStock(null);
      } catch (err: unknown) {
        setFeedbackError(handleApiError(err));
      }
    },
  });

  const abrirModalCrear = (): void => {
    setProductoEditando(null);
    setFeedbackError(null);
    formProducto.reset();
    formProducto.setFieldValue("nombre", "");
    formProducto.setFieldValue("descripcion", "");
    formProducto.setFieldValue("precio_base", "0");
    formProducto.setFieldValue("imagen_url", "");
    formProducto.setFieldValue("stock", "10");
    formProducto.setFieldValue("disponible", true);
    formProducto.setFieldValue(
      "categoria_id",
      categorias && categorias.length > 0 ? categorias[0].id : 0
    );
    setModalFormAbierto(true);
  };

  const abrirModalEditar = (prod: Producto): void => {
    setProductoEditando(prod);
    setFeedbackError(null);
    formProducto.reset();
    formProducto.setFieldValue("nombre", prod.nombre);
    formProducto.setFieldValue("descripcion", prod.descripcion ?? "");
    formProducto.setFieldValue("precio_base", String(prod.precio_base));
    formProducto.setFieldValue("imagen_url", prod.imagen_url ?? "");
    formProducto.setFieldValue("stock", String(prod.stock));
    formProducto.setFieldValue("disponible", prod.disponible);
    formProducto.setFieldValue("categoria_id", prod.categoria_id);
    setModalFormAbierto(true);
  };

  const abrirModalStock = (prod: Producto): void => {
    setProductoStock(prod);
    setFeedbackError(null);
    formStock.reset();
    formStock.setFieldValue("stock", String(prod.stock));
    formStock.setFieldValue("disponible", prod.disponible);
    setModalStockAbierto(true);
  };

  const handleEliminar = async (prod: Producto): Promise<void> => {
    setFeedbackError(null);
    try {
      await eliminarMutation.mutateAsync(prod.id);
    } catch (err: unknown) {
      setFeedbackError(handleApiError(err));
    }
  };

  const columns = useMemo<ColumnDef<Producto>[]>(
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
        header: "Producto",
        accessorKey: "nombre",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-900">
              {row.original.nombre}
            </p>
            <p className="text-xs text-slate-500">
              {row.original.categoria?.nombre ??
                `Categoría #${row.original.categoria_id}`}
            </p>
          </div>
        ),
      },
      {
        header: "Precio Base",
        accessorKey: "precio_base",
        cell: ({ row }) => (
          <span className="font-bold text-slate-900">
            ${row.original.precio_base.toLocaleString("es-AR")}
          </span>
        ),
      },
      {
        header: "Stock",
        accessorKey: "stock",
        cell: ({ row }) => (
          <span
            className={`font-semibold ${
              row.original.stock > 0 ? "text-slate-900" : "text-red-600"
            }`}
          >
            {row.original.stock} u.
          </span>
        ),
      },
      {
        header: "Disponibilidad",
        accessorKey: "disponible",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              row.original.disponible
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {row.original.disponible ? "Disponible" : "No disponible"}
          </span>
        ),
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const prod = row.original;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => abrirModalStock(prod)}
              >
                Stock / Disp.
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => abrirModalEditar(prod)}
              >
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={
                  eliminarMutation.isPending &&
                  eliminarMutation.variables === prod.id
                }
                onClick={() => void handleEliminar(prod)}
              >
                Baja
              </Button>
            </div>
          );
        },
      },
    ],
    [eliminarMutation.isPending, eliminarMutation.variables]
  );

  const tableData = useMemo(
    () => productosPaginados?.items ?? [],
    [productosPaginados]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Administración de Productos
          </h1>
          <p className="text-sm text-slate-600">
            Gestiona el catálogo de platos, precios, stock y disponibilidad
          </p>
        </div>
        <Button variant="primary" onClick={abrirModalCrear}>
          + Nuevo producto
        </Button>
      </div>

      {feedbackError && !modalFormAbierto && !modalStockAbierto && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          {feedbackError}
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
          titulo="No hay productos activos"
          descripcion="Registra productos en el catálogo para habilitar las ventas."
          accion={
            <Button variant="primary" onClick={abrirModalCrear}>
              Crear producto
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
              {Math.max(1, table.getPageCount())} ({tableData.length} productos)
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

      {/* Modal Crear / Editar Producto */}
      <Modal
        isOpen={modalFormAbierto}
        onClose={() => setModalFormAbierto(false)}
        title={
          productoEditando
            ? `Editar Producto #${productoEditando.id}`
            : "Nuevo Producto"
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
            void formProducto.handleSubmit();
          }}
          className="space-y-4"
        >
          <formProducto.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 1
                  ? "El nombre del producto es obligatorio"
                  : undefined,
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
                  label="Nombre *"
                  placeholder="Ej: Hamburguesa Doble"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorMsg}
                />
              );
            }}
          />

          <formProducto.Field
            name="categoria_id"
            children={(field) => (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor={field.name}
                  className="text-sm font-medium text-slate-700"
                >
                  Categoría *
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  <option value={0} disabled>
                    Selecciona una categoría
                  </option>
                  {(categorias ?? []).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <formProducto.Field
              name="precio_base"
              validators={{
                onChange: ({ value }) =>
                  Number(value) < 0 || Number.isNaN(Number(value))
                    ? "Precio inválido (>= 0)"
                    : undefined,
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
                    type="number"
                    step="0.01"
                    min="0"
                    label="Precio base ($) *"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={errorMsg}
                  />
                );
              }}
            />

            <formProducto.Field
              name="stock"
              validators={{
                onChange: ({ value }) =>
                  Number(value) < 0 || !Number.isInteger(Number(value))
                    ? "Stock entero >= 0"
                    : undefined,
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
                    type="number"
                    step="1"
                    min="0"
                    label="Stock inicial *"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={errorMsg}
                  />
                );
              }}
            />
          </div>

          <formProducto.Field
            name="imagen_url"
            children={(field) => (
              <Input
                id={field.name}
                name={field.name}
                label="URL de imagen"
                placeholder="https://images.unsplash.com/..."
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          />

          <formProducto.Field
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
                  rows={2}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            )}
          />

          <formProducto.Field
            name="disponible"
            children={(field) => (
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                Disponible para la venta en el catálogo
              </label>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalFormAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={
                crearMutation.isPending || actualizarMutation.isPending
              }
            >
              {productoEditando ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ajuste Rápido de Stock y Disponibilidad (PATCH /productos/{id}/stock) */}
      <Modal
        isOpen={modalStockAbierto}
        onClose={() => setModalStockAbierto(false)}
        title={
          productoStock
            ? `Stock y Disponibilidad — ${productoStock.nombre}`
            : "Ajustar Stock"
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
            void formStock.handleSubmit();
          }}
          className="space-y-4"
        >
          <formStock.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                Number(value) < 0 || !Number.isInteger(Number(value))
                  ? "El stock debe ser un entero mayor o igual a 0"
                  : undefined,
            }}
            children={(field) => {
              const errorMsg =
                field.state.meta.errors.length > 0
                  ? field.state.meta.errors.map((err) => String(err)).join(", ")
                  : undefined;

              return (
                <Input
                  id="patch-stock"
                  name={field.name}
                  type="number"
                  step="1"
                  min="0"
                  label="Cantidad en stock *"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorMsg}
                />
              );
            }}
          />

          <formStock.Field
            name="disponible"
            children={(field) => (
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                Habilitado como disponible para la venta
              </label>
            )}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalStockAbierto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={stockMutation.isPending}
            >
              Actualizar stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}