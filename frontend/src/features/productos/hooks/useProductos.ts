import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
  updateProductoStock,
} from "../api/productos";
import type { ProductoFiltros } from "../types";

export function useProductos(filtros: ProductoFiltros) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => getProductos(filtros),
  });
}

export function useCrearProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useActualizarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useActualizarStockProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProductoStock,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useEliminarProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}