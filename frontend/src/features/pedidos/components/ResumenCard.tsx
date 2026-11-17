import { Card } from "../../../shared/ui/Card";

interface ResumenCardProps {
  titulo: string;
  valor: string | number;
  subtitulo: string;
  colorClase?: string;
}

export function ResumenCard({
  titulo,
  valor,
  subtitulo,
  colorClase = "text-slate-900",
}: ResumenCardProps) {
  return (
    <Card className="p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {titulo}
      </p>
      <p className={`mt-2 text-3xl font-extrabold ${colorClase}`}>{valor}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitulo}</p>
    </Card>
  );
}