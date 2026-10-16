import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import TooltipGrafico from './TooltipGrafico';
import EtiquetaEje from './EtiquetaEje';
import { COLOR_PRINCIPAL, COLOR_SECUNDARIO, COLOR_GRILLA, COLOR_CURSOR, COLOR_TEXTO, TICK_EJE } from './colores';
import { formatearEntero } from '../../../shared/utils/formato';

const ALTO_FILA = 46;

// REQ-F11-05: unidades solicitadas frente a vendidas por variedad (dos series → leyenda)
const GraficoVariedades = ({ datos }) => (
  <ResponsiveContainer width="100%" height={Math.max(160, datos.length * ALTO_FILA + 56)}>
    <BarChart data={datos} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={10} barGap={2}>
      <CartesianGrid horizontal={false} stroke={COLOR_GRILLA} />
      <XAxis type="number" tick={TICK_EJE} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={formatearEntero} />
      <YAxis type="category" dataKey="nombre" width={130} tick={<EtiquetaEje ancho={130} />} tickLine={false} axisLine={false} />
      <Tooltip cursor={{ fill: COLOR_CURSOR }} content={<TooltipGrafico formatear={(v) => `${formatearEntero(v)} und.`} />} />
      <Legend verticalAlign="top" align="left" iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, color: COLOR_TEXTO, paddingBottom: 8 }} />
      <Bar dataKey="solicitadas" name="Solicitadas" fill={COLOR_SECUNDARIO} radius={[0, 4, 4, 0]} maxBarSize={14} isAnimationActive={false} />
      <Bar dataKey="vendidas" name="Vendidas" fill={COLOR_PRINCIPAL} radius={[0, 4, 4, 0]} maxBarSize={14} isAnimationActive={false} />
    </BarChart>
  </ResponsiveContainer>
);

export default GraficoVariedades;
