import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainLayout } from "../shared/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute";

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
          <Route path="/" element={<PlaceholderScreen title="Catálogo" />} />
          <Route path="/login" element={<PlaceholderScreen title="Iniciar Sesión" />} />
          <Route path="/register" element={<PlaceholderScreen title="Registro" />} />
          <Route path="/carrito" element={<PlaceholderScreen title="Carrito" />} />
          <Route
            path="/unauthorized"
            element={<PlaceholderScreen title="Sin permiso" />}
          />

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