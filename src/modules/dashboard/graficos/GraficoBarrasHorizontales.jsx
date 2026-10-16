import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import TooltipGrafico from './TooltipGrafico';
import EtiquetaEje from './EtiquetaEje';
import { COLOR_PRINCIPAL, COLOR_GRILLA, COLOR_CURSOR, COLOR_TEXTO, TICK_EJE } from './colores';

const ALTO_FILA = 34;

// Barras horizontales de una sola serie para comparar magnitudes entre categorías.
// datos: [{ nombre, valor, detalle?, color? }] — color permite énfasis (p. ej. estados finales en gris)
const GraficoBarrasHorizontales = ({ datos, formatear = (v) => v, formatearEje, nombreSerie = 'Valor', anchoEtiquetas = 130 }) => (
  <ResponsiveContainer width="100%" height={Math.max(120, datos.length * ALTO_FILA + 24)}>
    <BarChart data={datos} layout="vertical" margin={{ top: 0, right: 64, left: 0, bottom: 0 }} barCategoryGap={6}>
      <CartesianGrid horizontal={false} stroke={COLOR_GRILLA} />
      <XAxis type="number" tickFormatter={formatearEje || formatear} tick={TICK_EJE} tickLine={false} axisLine={false} allowDecimals={false} />
      <YAxis type="category" dataKey="nombre" width={anchoEtiquetas} tick={<EtiquetaEje ancho={anchoEtiquetas} />} tickLine={false} axisLine={false} />
      <Tooltip cursor={{ fill: COLOR_CURSOR }} content={<TooltipGrafico formatear={formatear} />} />
      <Bar dataKey="valor" name={nombreSerie} fill={COLOR_PRINCIPAL} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
        {datos.map((d, i) => <Cell key={i} fill={d.color || COLOR_PRINCIPAL} />)}
        <LabelList dataKey="valor" position="right" formatter={formatear} style={{ fontSize: 12, fill: COLOR_TEXTO, fontWeight: 600 }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default GraficoBarrasHorizontales;
