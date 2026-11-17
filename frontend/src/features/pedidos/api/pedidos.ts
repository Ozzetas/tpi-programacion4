import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
  CambioEstadoPayload,
  Pedido,
  PedidoCreate,
  PedidoFiltros,
  PedidosPaginados,
  ResumenPedidos,
} from "../types";

export async function crearPedido(payload: PedidoCreate): Promise<Pedido> {
  const { data } = await axiosInstance.post<Pedido>("/pedidos", payload);
  return data;
}

export async function getPedidos(
  filtros: PedidoFiltros
): Promise<PedidosPaginados> {
  const params: Record<string, string | number> = {
    skip: filtros.skip ?? 0,
    limit: filtros.limit ?? 20,
  };

  if (filtros.estado) {
    params.estado = filtros.estado;
  }

  const { data } = await axiosInstance.get<PedidosPaginados>("/pedidos", {
    params,
  });
  return data;
}

export async function getPedidoById(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.get<Pedido>(`/pedidos/${id}`);
  return data;
}

export async function cambiarEstadoPedido(params: {
  id: number;
  payload: CambioEstadoPayload;
}): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(
    `/pedidos/${params.id}/estado`,
    params.payload
  );
  return data;
}

export async function cancelarPedidoCliente(id: number): Promise<Pedido> {
  const { data } = await axiosInstance.patch<Pedido>(
    `/pedidos/${id}/cancelar`
  );
  return data;
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await axiosInstance.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}