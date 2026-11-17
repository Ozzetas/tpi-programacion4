import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategoria,
  deleteCategoria,
  getCategorias,
  updateCategoria,
} from "../api/categorias";

export const CATEGORIAS_QUERY_KEY = ["categorias"] as const;

export function useCategorias() {
  return useQuery({
    queryKey: CATEGORIAS_QUERY_KEY,
    queryFn: getCategorias,
  });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY });
    },
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY });
    },
  });
}