import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pedidosService } from "./pedidosService";
import { clientesService } from "./clientesService";
import { usePedidoDraftStore } from "@/core/store/pedidoDraftStore";
import toast from "react-hot-toast";
import { Search, Plus, Trash2, User, CheckCircle, XCircle, DollarSign } from "lucide-react";

import { configuracionService, PrendaCatalogo } from "@/features/configuracion/configuracionService";
import { printTicket } from "@/core/utils/printUtils";

// Modal ticket
const ModalTicket: React.FC<{ ticket: any; onClose: () => void }> = ({ ticket, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="bg-gradient-to-r from-brand-primary to-brand-purple p-5 rounded-t-2xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg">Pedido Registrado</h3>
            <p className="text-blue-100 text-sm">{ticket?.encabezado?.ticket ?? ""}</p>
          </div>
          <CheckCircle size={32} />
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Cliente</span>
          <span className="font-semibold text-brand-main">{ticket?.cliente?.nombres ?? "-"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Prendas</span>
          <span className="font-semibold">{ticket?.detalles?.length ?? 0} item(s)</span>
        </div>
        <div className="border-t pt-3 flex justify-between">
          <span className="font-bold text-brand-main">Total a Pagar</span>
          <span className="font-extrabold text-xl text-brand-primary">
            S/ {parseFloat(ticket?.total ?? "0").toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-gray-400 text-center">Total calculado por la base de datos.</p>
      </div>
      <div className="p-4 border-t flex gap-3">
        <button onClick={() => printTicket(ticket)} className="px-4 py-2 border-2 border-brand-primary text-brand-primary font-bold rounded-xl hover:bg-brand-primary/10 transition-colors flex items-center justify-center gap-2 w-full">
          🖨️ Imprimir
        </button>
        <button onClick={onClose} className="btn-primary w-full">Cerrar</button>
      </div>
    </div>
  </div>
);

const SERVICIOS = ["Lavado Simple", "Lavado y Planchado", "Lavado en Seco", "Planchado Especial"];

export const RegistrarPedidoPage: React.FC = () => {
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [prendaSeleccionada, setPrendaSeleccionada] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);

  // Estados para Pago Inicial
  const [conPagoInicial, setConPagoInicial] = useState(false);
  const [montoPago, setMontoPago] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  // Todo el estado de borrador viene del store global (sobrevive la navegacion)
  const {
    docBusqueda, setDocBusqueda,
    clienteEncontrado, setClienteEncontrado,
    mostrarFormCliente, setMostrarFormCliente,
    nuevoCliente, setNuevoCliente,
    detalles, agregarDetalle, cambiarCantidad, quitarDetalle,
    resetDraft,
  } = usePedidoDraftStore();

  const [catalogo, setCatalogo] = useState<PrendaCatalogo[]>([]);
  
  React.useEffect(() => {
    configuracionService.getCatalogo().then(data => setCatalogo(data.filter(p => p.estado === 1)));
  }, []);

  const buscarCliente = async (doc: string) => {
    setBuscandoCliente(true);
    setClienteEncontrado(null);
    setMostrarFormCliente(false);
    const resultado = await clientesService.buscarPorDocumento(doc.trim());
    if (resultado) {
      setClienteEncontrado(resultado);
      toast.success(`Cliente: ${resultado.nombres}`);
    } else {
      setMostrarFormCliente(true);
      setNuevoCliente({ documento: doc.trim() });
      toast("Cliente no encontrado. Registra sus datos.", { icon: "ℹ️" });
    }
    setBuscandoCliente(false);
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 12);
    setDocBusqueda(val);
    setClienteEncontrado(null);
    setMostrarFormCliente(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length >= 7) {
      debounceRef.current = setTimeout(() => buscarCliente(val), 400);
    }
  };

  const handleAgregarPrenda = () => {
    if (!prendaSeleccionada) { toast.error("Selecciona una prenda."); return; }
    const prenda = catalogo.find((p) => p.idPrenda === prendaSeleccionada);
    if (!prenda) return;
    agregarDetalle({ ...prenda, cantidad: 1, descripcion: prenda.nombrePrenda });
    setPrendaSeleccionada(0);
  };

  const subtotalVisual = detalles.reduce((acc, d) => acc + d.precio * d.cantidad, 0);

  const handleSubmit = async () => {
    if (!clienteEncontrado && !mostrarFormCliente) { toast.error("Busca al cliente primero."); return; }
    if (detalles.length === 0) { toast.error("Agrega al menos una prenda."); return; }
    setSubmitting(true);
    try {
      let idCliente = clienteEncontrado?.idCliente;
      if (!idCliente) {
        if (!nuevoCliente.nombres || !nuevoCliente.telefono) {
          toast.error("Completa nombre y telefono del cliente."); setSubmitting(false); return;
        }
        const creado = await clientesService.crear(nuevoCliente);
        idCliente = creado.idCliente;
        toast.success("Cliente registrado.");
      }
      
      const payload: any = {
        idCliente,
        detalles: detalles.map((d) => ({ idPrenda: d.idPrenda, cantidad: d.cantidad, descripcion: d.descripcion })),
      };

      if (conPagoInicial) {
        const monto = parseFloat(montoPago);
        if (isNaN(monto) || monto <= 0) {
          toast.error("Ingresa un monto de pago válido."); setSubmitting(false); return;
        }
        payload.pagoInicial = { monto, metodo: metodoPago };
      }

      const resultado = await pedidosService.crear(payload);
      setTicketData(resultado.data.ticket);
      toast.success("Pedido registrado exitosamente.");
      resetDraft(); // Limpia el borrador solo al exito
      setConPagoInicial(false);
      setMontoPago("");
      setMetodoPago("Efectivo");
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Error al registrar el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Indicador de borrador guardado */}
      {(detalles.length > 0 || clienteEncontrado) && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-sm">
          <span className="text-amber-700">Tienes un pedido en borrador guardado.</span>
          <button onClick={resetDraft} className="text-red-500 hover:underline font-medium">Limpiar borrador</button>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-extrabold text-brand-main">Registrar Pedido</h1>
        <p className="text-sm text-gray-400 mt-1">Busca al cliente por DNI y agrega las prendas del servicio.</p>
      </div>

      {/* Paso 1: Cliente */}
      <div className="card space-y-4 joyride-registrar-cliente">
        <h2 className="font-bold text-brand-main flex items-center gap-2"><User size={18} /> Paso 1: Identificar Cliente</h2>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input type="text" value={docBusqueda} onChange={handleDocChange}
              placeholder="Ingresa DNI o documento del cliente..."
              className="input-field pl-9" maxLength={12} />
          </div>
          {buscandoCliente && <span className="flex items-center text-sm text-gray-400 animate-pulse">Buscando...</span>}
        </div>

        {clienteEncontrado && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-brand-main">{clienteEncontrado.nombres}</p>
              <p className="text-sm text-gray-500">DNI: {clienteEncontrado.documento} · Tel: {clienteEncontrado.telefono}</p>
            </div>
            <button onClick={() => { setClienteEncontrado(null); setDocBusqueda(""); }} className="text-gray-400 hover:text-red-500">
              <XCircle size={18} />
            </button>
          </div>
        )}

        {mostrarFormCliente && !clienteEncontrado && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-amber-700">Cliente nuevo — Completa sus datos:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={nuevoCliente.documento} readOnly className="input-field bg-gray-100" placeholder="Documento" />
              <input value={nuevoCliente.nombres} onChange={e => setNuevoCliente({ nombres: e.target.value })}
                className="input-field" placeholder="Nombres completos *" />
              <input value={nuevoCliente.telefono} onChange={e => setNuevoCliente({ telefono: e.target.value })}
                className="input-field" placeholder="Telefono *" maxLength={15} />
              <input value={nuevoCliente.direccion} onChange={e => setNuevoCliente({ direccion: e.target.value })}
                className="input-field" placeholder="Direccion (opcional)" />
            </div>
          </div>
        )}
      </div>

      {/* Paso 2: Prendas */}
      <div className="card space-y-4 joyride-registrar-prendas">
        <h2 className="font-bold text-brand-main flex items-center gap-2"><Plus size={18} /> Paso 2: Agregar Prendas</h2>
        <div className="flex gap-3">
          <select value={prendaSeleccionada} onChange={e => setPrendaSeleccionada(Number(e.target.value))} className="input-field flex-1">
            <option value={0}>-- Selecciona prenda y servicio --</option>
            {SERVICIOS.map(srv => (
              <optgroup key={srv} label={srv}>
                {catalogo.filter(p => p.servicio === srv).map(p => (
                  <option key={p.idPrenda} value={p.idPrenda}>{p.nombrePrenda} — S/ {p.precio.toFixed(2)}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <button onClick={handleAgregarPrenda} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Agregar
          </button>
        </div>

        {detalles.length > 0 ? (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-bg text-brand-muted">
                  <th className="px-4 py-2 text-left font-semibold">Prenda</th>
                  <th className="px-4 py-2 text-center font-semibold">Cant.</th>
                  <th className="px-4 py-2 text-right font-semibold">P. Unit.</th>
                  <th className="px-4 py-2 text-right font-semibold">Subtotal</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {detalles.map((d, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-brand-main">{d.nombrePrenda}</td>
                    <td className="px-4 py-2 text-center">
                      <input type="number" min={0.1} step="0.10" value={d.cantidad}
                        onChange={e => cambiarCantidad(idx, parseFloat(e.target.value) || 0)}
                        className="w-20 text-center border border-gray-200 rounded-lg py-1 outline-none focus:ring-1 focus:ring-brand-primary" 
                        title="Puedes ingresar decimales para kilos"
                      />
                    </td>
                    <td className="px-4 py-2 text-right text-gray-500">S/ {d.precio.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-semibold">S/ {(d.precio * d.cantidad).toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">
                      <button onClick={() => quitarDetalle(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-brand-bg px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-500">Subtotal estimado (referencial)</span>
              <span className="text-lg font-extrabold text-brand-primary">S/ {subtotalVisual.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-400 text-center pb-2">El total final lo calcula la base de datos.</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-3xl mb-2">👕</p>
            <p className="text-sm">Aun no has agregado prendas al pedido.</p>
          </div>
        )}
      </div>

      {/* Paso 3: Pago Inicial (Opcional) */}
      <div className="card space-y-4 joyride-registrar-pago">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-brand-main flex items-center gap-2">
            <DollarSign size={18} /> Paso 3: Pago Inicial / Adelanto (Opcional)
          </h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={conPagoInicial} onChange={e => setConPagoInicial(e.target.checked)} className="rounded text-brand-primary focus:ring-brand-primary" />
            <span className="text-sm font-medium text-gray-600">Registrar adelanto ahora</span>
          </label>
        </div>

        {conPagoInicial && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto a pagar (S/)</label>
              <input type="number" min="0.10" step="0.10" value={montoPago} onChange={e => setMontoPago(e.target.value)}
                placeholder="Ej. 15.00" className="input-field bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Método de Pago</label>
              <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} className="input-field bg-white">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta (POS)</option>
                <option value="Yape/Plin">Yape / Plin</option>
              </select>
            </div>
            <p className="sm:col-span-2 text-xs text-brand-purple">
              * El monto será descontado del total a pagar en el ticket final generado.
            </p>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 joyride-registrar-acciones">
        <button onClick={() => navigate("/pedidos")}
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium">
          Cancelar
        </button>
        <button onClick={handleSubmit}
          disabled={submitting || (!clienteEncontrado && !mostrarFormCliente) || detalles.length === 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? "Registrando..." : "Registrar Pedido"}
        </button>
      </div>

      {ticketData && <ModalTicket ticket={ticketData} onClose={() => { setTicketData(null); navigate("/pedidos"); }} />}
    </div>
  );
};