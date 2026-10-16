// Tooltip común de los gráficos: título, una fila por serie y detalle opcional del dato
const TooltipGrafico = ({ active, payload, label, formatear = (v) => v, titulo }) => {
  if (!active || !payload?.length) return null;
  const dato = payload[0].payload;

  return (
    <div className="bg-cafe-leche border border-cafe-espresso/15 shadow-lg rounded-sm px-3 py-2 text-xs max-w-[16rem]">
      <p className="font-bold text-cafe-espresso mb-1 capitalize">{titulo ? titulo(dato) : (label ?? dato.nombre)}</p>
      {payload.map(serie => (
        <p key={serie.dataKey} className="flex items-center gap-2 text-cafe-tostado">
          <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: serie.color || serie.payload?.color }} />
          {serie.name}: <span className="font-bold text-cafe-espresso tabular-nums">{formatear(serie.value)}</span>
        </p>
      ))}
      {dato.detalle && <p className="text-cafe-tostado/80 mt-1">{dato.detalle}</p>}
    </div>
  );
};

export default TooltipGrafico;
