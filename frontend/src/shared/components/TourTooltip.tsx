import React from 'react';
import { TooltipRenderProps } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export const TourTooltip: React.FC<TooltipRenderProps> = ({
  continuous,
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
  size,
}) => {
  const { t } = useTranslation();

  return (
    <div
      {...tooltipProps}
      className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100 flex flex-col relative"
      style={{ zIndex: 10000 }}
    >
      {/* Botón de cerrar superior */}
      <button
        {...skipProps}
        className="absolute top-4 right-4 p-1.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
        title={t('tour.skip')}
      >
        <X size={16} />
      </button>

      {/* Título y Contenido */}
      <div className="mb-6 mt-1 pr-6">
        {step.content}
      </div>

      {/* Footer: Controles y Paginación */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
        <div className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
          {index + 1} / {size}
        </div>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-brand-main transition-colors hover:bg-gray-50 rounded-xl border border-transparent"
            >
              {t('tour.prev')}
            </button>
          )}

          <button
            {...primaryProps}
            className="px-5 py-2 text-sm font-bold text-white bg-brand-primary hover:bg-indigo-600 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {isLastStep ? t('tour.close') : t('tour.next')}
          </button>
        </div>
      </div>
    </div>
  );
};
