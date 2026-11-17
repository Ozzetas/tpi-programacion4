import { Link } from "react-router-dom";
import { Card } from "../../../shared/ui/Card";
import { Button } from "../../../shared/ui/Button";

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-lg py-12">
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-xl">
          !
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-slate-600">
          No cuentas con los permisos necesarios para acceder a esta sección del
          sistema.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary">Volver al catálogo</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}