import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <h3 className="text-lg font-semibold text-slate-900">{titulo}</h3>
      {descripcion && (
        <p className="mt-1 max-w-md text-sm text-slate-500">{descripcion}</p>
      )}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}