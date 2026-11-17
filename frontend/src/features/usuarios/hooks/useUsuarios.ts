import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activarUsuarioAdmin,
  desactivarUsuarioAdmin,
  getUsuariosAdmin,
} from "../api/usuarios";

export const USUARIOS_ADMIN_QUERY_KEY = ["admin-usuarios"] as const;

export function useUsuarios() {
  return useQuery({
    queryKey: USUARIOS_ADMIN_QUERY_KEY,
    queryFn: getUsuariosAdmin,
  });
}

export function useActivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activarUsuarioAdmin,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: USUARIOS_ADMIN_QUERY_KEY,
      });
    },
  });
}

export function useDesactivarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: desactivarUsuarioAdmin,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: USUARIOS_ADMIN_QUERY_KEY,
      });
    },
  });
}