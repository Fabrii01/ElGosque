import { COLOR_ESTADO_BIEN, COLOR_ESTADO_ALERTA } from './colores';
import { formatearPorcentaje } from '../../../shared/utils/formato';

// Medidor de un indicador de la tesis contra su meta. El color de estado siempre va con ícono y texto.
const MedidorIndicador = ({ titulo, indicador, definicion }) => {
  const { valor, cumplen, base, meta } = indicador;
  const sinDatos = valor === null;
  const cumple = !sinDatos && valor >= meta;

  return (
    <div className="bg-cafe-leche rounded-md p-5 border border-cafe-espresso/10 shadow-sm flex flex-col min-w-0">
      <p className="text-xs font-bold text-cafe-tostado/80 uppercase tracking-wider">{titulo}</p>
      <div className="flex flex-wrap items-end justify-between gap-2 mt-2 mb-3">
        <span className="text-3xl font-titulo font-semibold text-cafe-espresso tabular-nums">{sinDatos ? '—' : formatearPorcentaje(valor)}</span>
        {!sinDatos && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full border ${cumple ? 'text-green-800 bg-cafe-hoja/10 border-cafe-hoja/30' : 'text-orange-800 bg-orange-50 border-orange-200'}`}>
            {cumple ? '✓ Cumple la meta' : '⚠ Bajo la meta'}
          </span>
        )}
      </div>

      <div className="relative h-2.5 bg-cafe-arena/60 rounded-full" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={sinDatos ? undefined : Math.round(valor * 100)} aria-label={titulo}>
        {!sinDatos && <div className="h-full rounded-full" style={{ width: `${Math.max(valor * 100, 1)}%`, background: cumple ? COLOR_ESTADO_BIEN : COLOR_ESTADO_ALERTA }} />}
        <div className="absolute -top-1 -bottom-1 w-0.5 bg-cafe-espresso" style={{ left: `${meta * 100}%` }} title={`Meta ${formatearPorcentaje(meta)}`} />
      </div>
      <div className="flex justify-between text-[10px] text-cafe-tostado/80 mt-1 font-bold">
        <span>{sinDatos ? 'Sin datos en el periodo' : `${cumplen} de ${base}`}</span>
        <span>Meta {formatearPorcentaje(meta)}</span>
      </div>

      <p className="text-xs text-cafe-tostado/80 mt-3 leading-relaxed">{definicion}</p>
    </div>
  );
};

export default MedidorIndicador;
