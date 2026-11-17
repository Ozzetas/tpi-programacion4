import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "../shared/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { UnauthorizedPage } from "../features/auth/pages/UnauthorizedPage";
import { CatalogoPage } from "../features/productos/pages/CatalogoPage";

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Rutas públicas */}
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/carrito" element={<PlaceholderScreen title="Carrito" />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rutas protegidas con sesión (cliente o admin) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<PlaceholderScreen title="Checkout" />} />
            <Route
              path="/mis-pedidos"
              element={<PlaceholderScreen title="Mis Pedidos" />}
            />
          </Route>

          {/* Rutas exclusivas de administración */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin/resumen"
              element={<PlaceholderScreen title="Resumen de Administración" />}
            />
            <Route
              path="/admin/categorias"
              element={<PlaceholderScreen title="ABM Categorías" />}
            />
            <Route
              path="/admin/productos"
              element={<PlaceholderScreen title="ABM Productos" />}
            />
            <Route
              path="/admin/pedidos"
              element={<PlaceholderScreen title="Gestión de Pedidos" />}
            />
            <Route
              path="/admin/usuarios"
              element={<PlaceholderScreen title="Gestión de Usuarios" />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}