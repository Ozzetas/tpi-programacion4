import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useAuthStore } from "../../../store/authStore";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";

export function LoginPage() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      setSubmitting(true);
      try {
        const usuario = await login(value.username.trim(), value.password);
        // Redirijo al panel administrativo si ingresa un admin o al catálogo si es un cliente
        if (usuario.role === "admin") {
          void navigate("/admin/resumen");
        } else {
          void navigate("/");
        }
      } catch (error: unknown) {
        setServerError(handleApiError(error));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-500">
            Ingresa tus credenciales para gestionar tus pedidos
          </p>
        </div>

        {serverError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {serverError}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3
                  ? "Ingresa un nombre de usuario válido (mínimo 3 caracteres)"
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
                  label="Usuario"
                  placeholder="Ej: admin o tu usuario"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorMsg}
                  autoComplete="username"
                />
              );
            }}
          />

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 1 ? "La contraseña es obligatoria" : undefined,
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
                  type="password"
                  label="Contraseña"
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorMsg}
                  autoComplete="current-password"
                />
              );
            }}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={submitting}
            >
              Ingresar
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Aún no tienes cuenta?{" "}
          <Link
            to="/register"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Regístrate aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}