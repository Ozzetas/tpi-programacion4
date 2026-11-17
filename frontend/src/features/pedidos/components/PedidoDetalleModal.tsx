import { Modal } from "../../../shared/ui/Modal";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import type { Pedido } from "../types";

interface PedidoDetalleModalProps {
  pedido: Pedido | null;
  onClose: () => void;
}

export function PedidoDetalleModal({
  pedido,
  onClose,
}: PedidoDetalleModalProps) {
  if (!pedido) return null;

  const fechaFormateada = new Date(pedido.created_at).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Detalle del Pedido #${pedido.id}`}
    >
      <div className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 p-3">
          <div>
            <p className="text-xs text-slate-500">Fecha de creación</p>
            <p className="font-medium text-slate-900">{fechaFormateada}</p>
          </div>
          <BadgeEstado estado={pedido.estado} />
        </div>

        <div className="grid grid-cols-1 gap-3 border-b border-slate-100 pb-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-500">Forma de pago</p>
            <p className="font-semibold text-slate-900">{pedido.forma_pago}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">
              Dirección de entrega
            </p>
            <p className="font-semibold text-slate-900">
              {pedido.direccion_entrega}
            </p>
          </div>
          {pedido.notas && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-slate-500">
                Notas adicionales
              </p>
              <p className="text-slate-700">{pedido.notas}</p>
            </div>
          )}
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-slate-900">
            Ítems del pedido (precios históricos congelados)
          </h4>
          <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            {pedido.items.map((item) => (
              <div
                key={item.producto_id}
                className="flex items-center justify-between px-3.5 py-2.5"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {item.nombre_producto}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.cantidad} x $
                    {item.precio_unitario.toLocaleString("es-AR")}
                  </p>
                </div>
                <span className="font-semibold text-slate-900">
                  ${item.subtotal.toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base font-bold text-slate-900">
          <span>Total del pedido</span>
          <span className="text-lg text-orange-600">
            ${pedido.total.toLocaleString("es-AR")}
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}