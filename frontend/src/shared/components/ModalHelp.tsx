import React, { useState } from 'react';
import { HelpCircle, X, ChevronRight } from 'lucide-react';

interface HelpItem {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

interface ModalHelpProps {
  items: HelpItem[];
  label?: string;
}

/**
 * Botón "?" que muestra un panel de ayuda contextual dentro de cualquier modal.
 * Uso: <ModalHelp items={[{ icon: '📋', title: '...', description: '...' }]} />
 */
export const ModalHelp: React.FC<ModalHelpProps> = ({ items, label = 'Ayuda' }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón disparador */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100"
        title="Ayuda sobre esta ventana"
      >
        <HelpCircle size={14} />
        <span className="hidden sm:inline">{label}</span>
      </button>

      {/* Panel de Ayuda (overlay dentro del modal) */}
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop que cierra al hacer clic */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Tarjeta de Ayuda */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center gap-2 text-white">
                <HelpCircle size={18} />
                <h3 className="font-extrabold text-base">Manual de esta ventana</h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Lista de explicaciones */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  {item.icon && (
                    <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  )}
                  <div>
                    <p className="font-bold text-sm text-gray-800 mb-0.5">{item.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-brand-primary hover:bg-indigo-600 rounded-xl transition-colors"
              >
                Entendido <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
