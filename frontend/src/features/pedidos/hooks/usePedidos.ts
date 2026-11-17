import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstadoPedido,
  cancelarPedidoCliente,
  crearPedido,
  getPedidoById,
  getPedidos,
  getResumenPedidos,
} from "../api/pedidos";
import type { PedidoFiltros } from "../types";

export function usePedidos(filtros: PedidoFiltros) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => getPedidos(filtros),
  });
}

export function usePedidoDetalle(id: number | null) {
  return useQuery({
    queryKey: ["pedido", id],
    queryFn: () => {
      if (id === null) {
        throw new Error("ID de pedido inválido");
      }
      return getPedidoById(id);
    },
    enabled: id !== null,
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearPedido,
    onSuccess: () => {
      // Invalido pedidos, resumen y productos porque la creación descuenta stock en la base de datos (RN-01)
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cambiarEstadoPedido,
    onSuccess: () => {
      // Invalido productos por si el cambio de estado administrativo fue hacia CANCELADO con restitución de stock (RN-03)
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelarPedidoCliente,
    onSuccess: () => {
      // Invalido productos para reflejar de inmediato el stock restituido tras la cancelación (RN-03)
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["pedidos-resumen"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ["pedidos-resumen"],
    queryFn: getResumenPedidos,
  });
}