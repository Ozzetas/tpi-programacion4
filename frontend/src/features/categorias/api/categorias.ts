import { axiosInstance } from "../../../shared/api/axiosInstance";
import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from "../types";

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await axiosInstance.get<Categoria[]>("/categorias");
  return data;
}

export async function createCategoria(
  payload: CategoriaCreate
): Promise<Categoria> {
  const { data } = await axiosInstance.post<Categoria>("/categorias", payload);
  return data;
}

export async function updateCategoria(params: {
  id: number;
  payload: CategoriaUpdate;
}): Promise<Categoria> {
  const { data } = await axiosInstance.put<Categoria>(
    `/categorias/${params.id}`,
    params.payload
  );
  return data;
}

export async function deleteCategoria(id: number): Promise<void> {
  await axiosInstance.delete(`/categorias/${id}`);
}