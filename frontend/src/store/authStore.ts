import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  axiosInstance,
  registerSessionCleanup,
} from "../shared/api/axiosInstance";
import type { Usuario } from "../features/usuarios/types";

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<Usuario>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username: string, password: string): Promise<Usuario> => {
        // El endpoint /auth/token exige formulario OAuth2 (application/x-www-form-urlencoded)
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        await axiosInstance.post("/auth/token", formData, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });

        const { data } = await axiosInstance.get<Usuario>("/auth/me");
        set({ usuario: data, cargando: false });
        return data;
      },

      logout: async (): Promise<void> => {
        try {
          await axiosInstance.post("/auth/logout");
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async (): Promise<void> => {
        set({ cargando: true });
        try {
          const { data } = await axiosInstance.get<Usuario>("/auth/me");
          set({ usuario: data, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },
    }),
    {
      name: "foodstore-auth-storage",
      // Persisto únicamente los datos públicos del usuario; el JWT vive solo en la cookie HttpOnly
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);

registerSessionCleanup(() => {
  useAuthStore.setState({ usuario: null, cargando: false });
});