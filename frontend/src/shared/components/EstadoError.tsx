import { Button } from "../ui/Button";

interface EstadoErrorProps {
  mensaje: string;
  onRetry?: () => void;
}

export function EstadoError({ mensaje, onRetry }: EstadoErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm font-medium text-red-800">{mensaje}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="danger" size="sm" onClick={onRetry}>
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}