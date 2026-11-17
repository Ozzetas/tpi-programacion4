import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock_maximo?: number;
  imagen_url?: string | null;
}

export interface NuevoCartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad?: number;
  stock_maximo?: number;
  imagen_url?: string | null;
}

interface CartState {
  items: CartItem[];
  agregar: (item: NuevoCartItem) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (nuevoItem: NuevoCartItem): void => {
        const cantidadAgregar = nuevoItem.cantidad ?? 1;
        if (cantidadAgregar < 1) return;

        set((state) => {
          const existente = state.items.find(
            (i) => i.producto_id === nuevoItem.producto_id
          );

          // Si el producto ya está en el carrito, acumulo su cantidad para no repetir líneas (RN-01)
          if (existente) {
            return {
              items: state.items.map((i) => {
                if (i.producto_id !== nuevoItem.producto_id) return i;
                const nuevaCantidad = i.cantidad + cantidadAgregar;
                const tope = nuevoItem.stock_maximo ?? i.stock_maximo;
                return {
                  ...i,
                  precio_unitario: nuevoItem.precio_unitario,
                  stock_maximo: tope,
                  cantidad:
                    tope !== undefined
                      ? Math.min(nuevaCantidad, tope)
                      : nuevaCantidad,
                };
              }),
            };
          }

          return {
            items: [
              ...state.items,
              {
                producto_id: nuevoItem.producto_id,
                nombre: nuevoItem.nombre,
                precio_unitario: nuevoItem.precio_unitario,
                cantidad: cantidadAgregar,
                stock_maximo: nuevoItem.stock_maximo,
                imagen_url: nuevoItem.imagen_url,
              },
            ],
          };
        });
      },

      quitar: (producto_id: number): void => {
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        }));
      },

      cambiarCantidad: (producto_id: number, cantidad: number): void => {
        if (cantidad <= 0) {
          get().quitar(producto_id);
          return;
        }

        set((state) => ({
          items: state.items.map((i) => {
            if (i.producto_id !== producto_id) return i;
            const cantidadFinal =
              i.stock_maximo !== undefined
                ? Math.min(cantidad, i.stock_maximo)
                : cantidad;
            return { ...i, cantidad: cantidadFinal };
          }),
        }));
      },

      vaciar: (): void => {
        set({ items: [] });
      },

      total: (): number => {
        const suma = get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0
        );
        return Math.round(suma * 100) / 100;
      },
    }),
    {
      name: "foodstore-cart-storage",
    }
  )
);