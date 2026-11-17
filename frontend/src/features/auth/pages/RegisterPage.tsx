import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../api/auth";
import { handleApiError } from "../../../shared/api/handleApiError";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";
import { Button } from "../../../shared/ui/Button";

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      void navigate("/login");
    },
    onError: (error: unknown) => {
      setServerError(handleApiError(error));
    },
  });

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      await registerMutation.mutateAsync({
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim(),
        password: value.password,
      });
    },
  });

  return (
    <div className="mx-auto max-w-md py-8">
      <Card className="p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="mt-1 text-sm text-slate-500">
            Regístrate para realizar pedidos en Food Store
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
                  ? "El usuario debe tener al menos 3 caracteres"
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
                  label="Nombre de usuario"
                  placeholder="Ej: gabriel_r"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorMsg}
                />
              );
            }}
          />

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? "Ingresa tu nombre y apellido"
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
                  label="Nombre completo"
                  placeholder="Ej: Juan Pérez"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorMsg}
                />
              );
            }}
          />

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                  ? "Ingresa un correo electrónico válido"
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
                  type="email"
                  label="Correo electrónico"
                  placeholder="cliente@ejemplo.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorMsg}
                />
              );
            }}
          />

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8
                  ? "La contraseña debe tener al menos 8 caracteres"
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
                  type="password"
                  label="Contraseña (mínimo 8 caracteres)"
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={errorMsg}
                />
              );
            }}
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={registerMutation.isPending}
            >
              Registrarme
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}