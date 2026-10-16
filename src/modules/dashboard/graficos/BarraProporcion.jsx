import { COLOR_PRINCIPAL, COLOR_SECUNDARIO } from './colores';
import { formatearEntero } from '../../../shared/utils/formato';

// Parte de un todo con dos categorías: barra 100 % apilada con hueco de 2px y etiquetas directas.
// partes: [{ nombre, valor }] (máximo 2; colores en orden fijo)
const COLORES = [COLOR_PRINCIPAL, COLOR_SECUNDARIO];

const BarraProporcion = ({ partes, unidad = '' }) => {
  const total = partes.reduce((s, p) => s + p.valor, 0);
  if (total === 0) return <p className="text-sm text-cafe-tostado/70 italic">Sin datos en este periodo.</p>;

  return (
    <div>
      <div className="flex h-4 rounded-full overflow-hidden gap-[2px] bg-cafe-leche" role="img" aria-label={partes.map(p => `${p.nombre}: ${p.valor}`).join(', ')}>
        {partes.map((p, i) => p.valor > 0 && (
          <div key={p.nombre} title={`${p.nombre}: ${formatearEntero(p.valor)} ${unidad}`} style={{ width: `${(p.valor / total) * 100}%`, background: COLORES[i] }} />
        ))}
      </div>
      <div className="flex justify-between gap-4 mt-3">
        {partes.map((p, i) => (
          <div key={p.nombre} className={i === 1 ? 'text-right' : ''}>
            <p className={`flex items-center gap-1.5 text-xs font-bold text-cafe-tostado/80 uppercase ${i === 1 ? 'justify-end' : ''}`}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORES[i] }} />{p.nombre}
            </p>
            <p className="text-2xl font-titulo font-semibold text-cafe-espresso tabular-nums">{Math.round((p.valor / total) * 100)} %</p>
            <p className="text-xs text-cafe-tostado/80 tabular-nums">{formatearEntero(p.valor)} {unidad}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarraProporcion;
