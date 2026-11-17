import { useState } from "react";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { useProductos } from "../hooks/useProductos";
import { ProductoCard } from "../components/ProductoCard";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { EstadoError } from "../../../shared/components/EstadoError";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";

const PAGE_LIMIT = 6;

export function CatalogoPage() {
  const [search, setSearch] = useState<string>("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [skip, setSkip] = useState<number>(0);

  const { data: categorias } = useCategorias();

  const {
    data: productosData,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductos({
    skip,
    limit: PAGE_LIMIT,
    search: search.trim() || undefined,
    categoria_id: categoriaId,
  });

  const handleSearchChange = (valor: string): void => {
    setSearch(valor);
    // Reinicio el desplazamiento a la primera página al cambiar el término de búsqueda
    setSkip(0);
  };

  const handleCategoriaChange = (nuevaCatId: number | undefined): void => {
    setCategoriaId(nuevaCatId);
    setSkip(0);
  };

  const limpiarFiltros = (): void => {
    setSearch("");
    setCategoriaId(undefined);
    setSkip(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Menú de Comidas
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Explora nuestras especialidades y arma tu pedido en línea
          </p>
        </div>

        <div className="w-full md:w-80">
          <Input
            id="buscar-producto"
            placeholder="Buscar por nombre (ej: pizza, hamburguesa)..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Filtro por categorías activas */}
      {categorias && categorias.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={categoriaId === undefined ? "primary" : "outline"}
            size="sm"
            onClick={() => handleCategoriaChange(undefined)}
          >
            Todas las categorías
          </Button>
          {categorias.map((cat) => (
            <Button
              key={cat.id}
              variant={categoriaId === cat.id ? "primary" : "outline"}
              size="sm"
              onClick={() => handleCategoriaChange(cat.id)}
            >
              {cat.nombre}
            </Button>
          ))}
        </div>
      )}

      {/* Estados de carga, error, vacío y grilla de resultados */}
      {isLoading ? (
        <Skeleton cantidad={PAGE_LIMIT} />
      ) : isError ? (
        <EstadoError
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : !productosData || productosData.items.length === 0 ? (
        <EstadoVacio
          titulo="No se encontraron productos"
          descripcion="No hay platos activos que coincidan con la búsqueda o categoría seleccionada."
          accion={
            (search.trim().length > 0 || categoriaId !== undefined) && (
              <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productosData.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          <Paginacion
            skip={skip}
            limit={PAGE_LIMIT}
            total={productosData.total}
            onPageChange={(nuevoSkip) => setSkip(nuevoSkip)}
          />
        </>
      )}
    </div>
  );
}