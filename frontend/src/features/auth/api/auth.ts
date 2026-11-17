import { axiosInstance } from "../../../shared/api/axiosInstance";
import type { Usuario } from "../../usuarios/types";
import type { RegisterPayload } from "../types";

export async function registerUser(payload: RegisterPayload): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>("/auth/register", payload);
  return data;
}