import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { Usuario } from "../types";

export async function getUsuariosAdmin(): Promise<Usuario[]> {
  const { data } = await axiosInstance.get<Usuario[]>("/admin/usuarios");
  return data;
}

export async function activarUsuarioAdmin(id: number): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>(
    `/admin/usuarios/${id}/activar`
  );
  return data;
}

export async function desactivarUsuarioAdmin(id: number): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>(
    `/admin/usuarios/${id}/desactivar`
  );
  return data;
}