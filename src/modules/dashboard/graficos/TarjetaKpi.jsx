import { formatearPorcentaje } from '../../../shared/utils/formato';

// Tarjeta de indicador clave con su variación frente al periodo anterior
const TarjetaKpi = ({ titulo, valor, variacion, ayuda, destacado = false }) => {
  const hayVariacion = variacion !== null && variacion !== undefined && Number.isFinite(variacion);
  const sube = hayVariacion && variacion > 0;
  const baja = hayVariacion && variacion < 0;

  return (
    <div className={`rounded-md p-4 md:p-5 border shadow-sm flex flex-col justify-between min-h-[7.5rem] min-w-0 ${destacado ? 'bg-cafe-hoja border-cafe-hoja text-white' : 'bg-cafe-leche border-cafe-espresso/10'}`}>
      <p className={`text-[11px] font-bold uppercase tracking-wider ${destacado ? 'text-cafe-crema/85' : 'text-cafe-tostado/80'}`} title={ayuda}>{titulo}</p>
      <p className={`text-lg sm:text-2xl md:text-3xl font-titulo font-semibold mt-1 tabular-nums whitespace-nowrap truncate ${destacado ? 'text-white' : 'text-cafe-espresso'}`}>{valor}</p>
      <p className={`text-xs font-bold mt-1 ${destacado ? 'text-cafe-crema' : sube ? 'text-green-700' : baja ? 'text-red-700' : 'text-cafe-tostado/70'}`}>
        {hayVariacion
          ? `${sube ? '▲' : baja ? '▼' : '='} ${formatearPorcentaje(Math.abs(variacion))} vs periodo anterior`
          : 'Sin comparación'}
      </p>
    </div>
  );
};

export default TarjetaKpi;
