import { Button } from "../ui/Button";

interface PaginacionProps {
  skip: number;
  limit: number;
  total: number;
  onPageChange: (nuevoSkip: number) => void;
}

export function Paginacion({
  skip,
  limit,
  total,
  onPageChange,
}: PaginacionProps) {
  const paginaActual = Math.floor(skip / limit) + 1;
  const totalPaginas = Math.max(1, Math.ceil(total / limit));

  if (total <= limit && skip === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-600">
        Mostrando{" "}
        <span className="font-semibold text-slate-900">
          {Math.min(skip + 1, total)}
        </span>{" "}
        a{" "}
        <span className="font-semibold text-slate-900">
          {Math.min(skip + limit, total)}
        </span>{" "}
        de <span className="font-semibold text-slate-900">{total}</span>{" "}
        resultados
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual <= 1}
          onClick={() => onPageChange(Math.max(0, skip - limit))}
        >
          Anterior
        </Button>
        <span className="px-2 text-sm font-medium text-slate-700">
          Página {paginaActual} de {totalPaginas}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={paginaActual >= totalPaginas}
          onClick={() => onPageChange(skip + limit)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}