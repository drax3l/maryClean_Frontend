import { create } from "zustand";
import { Cliente } from "@/features/pedidos/clientesService";

export interface DetalleItem {
  idPrenda: number;
  nombrePrenda: string;
  precio: number;
  cantidad: number;
  descripcion: string;
}

interface PedidoDraftState {
  // Cliente
  docBusqueda: string;
  clienteEncontrado: Cliente | null;
  mostrarFormCliente: boolean;
  nuevoCliente: { documento: string; nombres: string; telefono: string; direccion: string };
  // Prendas
  detalles: DetalleItem[];
  // Acciones
  setDocBusqueda: (doc: string) => void;
  setClienteEncontrado: (c: Cliente | null) => void;
  setMostrarFormCliente: (v: boolean) => void;
  setNuevoCliente: (data: Partial<PedidoDraftState["nuevoCliente"]>) => void;
  agregarDetalle: (item: DetalleItem) => void;
  cambiarCantidad: (idx: number, cantidad: number) => void;
  quitarDetalle: (idx: number) => void;
  resetDraft: () => void;
}

const INITIAL_NUEVO_CLIENTE = { documento: "", nombres: "", telefono: "", direccion: "" };

export const usePedidoDraftStore = create<PedidoDraftState>((set, get) => ({
  docBusqueda: "",
  clienteEncontrado: null,
  mostrarFormCliente: false,
  nuevoCliente: { ...INITIAL_NUEVO_CLIENTE },
  detalles: [],

  setDocBusqueda: (doc) => set({ docBusqueda: doc }),
  setClienteEncontrado: (c) => set({ clienteEncontrado: c }),
  setMostrarFormCliente: (v) => set({ mostrarFormCliente: v }),
  setNuevoCliente: (data) =>
    set((s) => ({ nuevoCliente: { ...s.nuevoCliente, ...data } })),

  agregarDetalle: (item) => {
    const { detalles } = get();
    const idx = detalles.findIndex((d) => d.idPrenda === item.idPrenda);
    if (idx >= 0) {
      set({
        detalles: detalles.map((d, i) =>
          i === idx ? { ...d, cantidad: d.cantidad + 1 } : d
        ),
      });
    } else {
      set({ detalles: [...detalles, item] });
    }
  },

  cambiarCantidad: (idx, cantidad) =>
    set((s) => ({
      detalles: s.detalles.map((d, i) => (i === idx ? { ...d, cantidad } : d)),
    })),

  quitarDetalle: (idx) =>
    set((s) => ({ detalles: s.detalles.filter((_, i) => i !== idx) })),

  resetDraft: () =>
    set({
      docBusqueda: "",
      clienteEncontrado: null,
      mostrarFormCliente: false,
      nuevoCliente: { ...INITIAL_NUEVO_CLIENTE },
      detalles: [],
    }),
}));