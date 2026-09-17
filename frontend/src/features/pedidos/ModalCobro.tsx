import React, { useState, useEffect } from "react";
import { pagosService, PagoHistorial, MetodoPago } from "./pagosService";
import toast from "react-hot-toast";
import { X, DollarSign, CreditCard, Smartphone, Printer, AlertTriangle, CheckCircle } from "lucide-react";
import { printRecibo } from "@/core/utils/printUtils";
import { ModalHelp } from "@/shared/components/ModalHelp";

interface ModalCobroProps {
  idPedido: number;
  ticketCodigo: string;
  onClose: () => void;
  onPagoExitoso: () => void;
}

export const ModalCobro: React.FC<ModalCobroProps> = ({ idPedido, ticketCodigo, onClose, onPagoExitoso }) => {
  const [historial, setHistorial] = useState<PagoHistorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [monto, setMonto] = useState<string>("");
  const [metodo, setMetodo] = useState<MetodoPago>("Efectivo");
  const [submitting, setSubmitting] = useState(false);
  const [recibo, setRecibo] = useState<any>(null);

  useEffect(() => {
    pagosService.obtenerHistorial(idPedido)
      .then(res => {
        setHistorial(res);
        if (res.saldo_pendiente > 0) {
          setMonto(res.saldo_pendiente.toString());
        }
      })
      .catch(() => toast.error("Error al cargar historial de pagos"))
      .finally(() => setLoading(false));
  }, [idPedido]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoFloat = parseFloat(monto);
    if (isNaN(montoFloat) || montoFloat <= 0) {
      toast.error("Ingresa un monto valido mayor a 0."); return;
    }
    setSubmitting(true);
    try {
      const res = await pagosService.registrarPago({ idPedido, monto: montoFloat, metodo });
      setRecibo(res.data.recibo);
      toast.success(res.message || "Pago registrado.");
      onPagoExitoso();
    } catch (err: any) {
      const isSobrepago = err.response?.data?.errors?.codigo_error === "SOBREPAGO_TRIGGER_45000";
      toast.error(isSobrepago 
        ? "El monto supera el saldo pendiente. Revisa el monto ingresado." 
        : err.response?.data?.message || "Error al registrar el pago.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-32 bg-gray-100 rounded mb-4"></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-brand-bg px-5 py-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-brand-main text-lg">Cobrar Pedido</h3>
            <p className="text-xs font-mono text-brand-primary">{ticketCodigo}</p>
          </div>
          <div className="flex items-center gap-2">
            <ModalHelp
              label="¿Cómo usar?"
              items={[
                {
                  icon: '💰',
                  title: 'Resumen de Pagos',
                  description: 'Muestra el total del pedido, cuánto se ha pagado hasta ahora y el saldo que falta. El Saldo Pendiente en rojo es lo que el cliente debe pagar.',
                },
                {
                  icon: '💳',
                  title: 'Monto a Cobrar',
                  description: 'Ingresa el monto que el cliente entrega. Se completa automáticamente con el saldo pendiente. Puedes cambiarlo para registrar un abono parcial.',
                },
                {
                  icon: '📲',
                  title: 'Método de Pago',
                  description: 'Selecciona cómo paga el cliente: Efectivo, Tarjeta (POS) o Yape/Plin. El método queda registrado en el historial.',
                },
                {
                  icon: '📜',
                  title: 'Pagos Anteriores',
                  description: 'Si el cliente ya hizo adelantos, aquí verás el detalle de cada abono con su fecha y método.',
                },
                {
                  icon: '🖨️',
                  title: 'Imprimir Recibo',
                  description: 'Luego de registrar el pago, puedes imprimir un recibo de confirmación para entregárselo al cliente.',
                },
              ]}
            />
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Resumen */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Total del pedido:</span>
              <span className="font-semibold">S/ {historial?.total?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-3 border-b pb-2 border-gray-200">
              <span className="text-sm text-gray-500">Total pagado:</span>
              <span className="font-semibold text-emerald-600">S/ {historial?.total_pagado?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-brand-main">Saldo Pendiente:</span>
              <span className="text-2xl font-extrabold text-red-500">S/ {historial?.saldo_pendiente?.toFixed(2)}</span>
            </div>
          </div>

          {/* Formulario (si hay saldo y no hay recibo nuevo) */}
          {historial && historial.saldo_pendiente > 0 && !recibo && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Monto a cobrar (S/)</label>
                <input 
                  type="number" 
                  step="0.10" 
                  min="0.1" 
                  max={historial.saldo_pendiente} 
                  value={monto} 
                  onChange={e => setMonto(e.target.value)} 
                  className="input-field text-lg font-bold" 
                  autoFocus 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Metodo de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setMetodo("Efectivo")} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${metodo === "Efectivo" ? "bg-brand-primary text-white border-brand-primary shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                    <DollarSign size={20} className="mb-1" />
                    <span className="text-xs font-medium">Efectivo</span>
                  </button>
                  <button type="button" onClick={() => setMetodo("Tarjeta")} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${metodo === "Tarjeta" ? "bg-brand-primary text-white border-brand-primary shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                    <CreditCard size={20} className="mb-1" />
                    <span className="text-xs font-medium">Tarjeta</span>
                  </button>
                  <button type="button" onClick={() => setMetodo("Yape/Plin")} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${metodo === "Yape/Plin" ? "bg-brand-primary text-white border-brand-primary shadow-sm" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                    <Smartphone size={20} className="mb-1" />
                    <span className="text-xs font-medium">Yape/Plin</span>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                <DollarSign size={18} /> {submitting ? "Procesando..." : "Registrar Pago"}
              </button>
            </form>
          )}

          {/* Historial previo */}
          {historial && historial.pagos.length > 0 && !recibo && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Pagos Anteriores</h4>
              <div className="space-y-2">
                {historial.pagos.map(p => (
                  <div key={p.idPago} className="flex justify-between items-center text-sm border border-gray-100 rounded-lg p-2 bg-white">
                    <div className="flex flex-col">
                      <span className="font-semibold text-brand-main">{p.metodo}</span>
                      <span className="text-xs text-gray-400">{new Date(p.fechaPago).toLocaleString("es-PE")}</span>
                    </div>
                    <span className="font-bold text-emerald-600">S/ {parseFloat(p.monto).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ya pagado */}
          {historial && historial.saldo_pendiente === 0 && !recibo && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-start gap-3 border border-emerald-200">
              <CheckCircle className="flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold">Pedido pagado en su totalidad.</p>
                <p className="text-sm">No es posible registrar mas pagos para este ticket.</p>
              </div>
            </div>
          )}

          {/* Recibo generado */}
          {recibo && (
            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 text-blue-600">
                <CheckCircle size={28} />
              </div>
              <h4 className="font-bold text-blue-800 text-lg">Pago Exitoso</h4>
              <p className="text-sm text-blue-700">Se abonaron <strong>S/ {parseFloat(recibo.monto_abonado).toFixed(2)}</strong> vía {recibo.metodo}.</p>
              {recibo.estado_pedido === "Pagado" && (
                <p className="text-xs bg-blue-100 text-blue-800 py-1 px-3 rounded-full inline-block mt-2">
                  El pedido cambio a estado "Pagado".
                </p>
              )}
              <div className="mt-4 border-t border-blue-200 pt-4 flex gap-3">
                <button onClick={() => printRecibo(recibo, ticketCodigo)} className="px-4 py-2 border border-blue-300 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 w-full">
                  <Printer size={16} /> Imprimir Recibo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};