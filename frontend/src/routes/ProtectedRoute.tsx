import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { RolUsuario } from "../features/usuarios/types";

interface ProtectedRouteProps {
  allowedRoles?: RolUsuario[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);

  if (cargando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-orange-600 border-t-transparent" />
          <span className="text-sm font-medium">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}