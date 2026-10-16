import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import TooltipGrafico from './TooltipGrafico';
import { COLOR_PRINCIPAL, COLOR_GRILLA, COLOR_EJE, COLOR_CURSOR, TICK_EJE } from './colores';
import { formatearSoles, formatearSolesCorto } from '../../../shared/utils/formato';

// REQ-F11-01/02: ingresos por mes en orden cronológico (una sola serie, un solo eje)
const GraficoColumnasMensual = ({ datos }) => {
  const conDetalle = datos.map(m => ({ ...m, detalle: `${m.pedidos} ${m.pedidos === 1 ? 'pedido' : 'pedidos'}` }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={conDetalle} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke={COLOR_GRILLA} />
        <XAxis dataKey="mes" tick={TICK_EJE} tickLine={false} axisLine={{ stroke: COLOR_EJE }} interval="preserveStartEnd" minTickGap={8} />
        <YAxis tickFormatter={formatearSolesCorto} tick={TICK_EJE} tickLine={false} axisLine={false} width={72} />
        <Tooltip cursor={{ fill: COLOR_CURSOR }} content={<TooltipGrafico formatear={formatearSoles} titulo={(d) => d.mesLargo} />} />
        <Bar dataKey="ingresos" name="Ingresos" fill={COLOR_PRINCIPAL} radius={[4, 4, 0, 0]} maxBarSize={44} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GraficoColumnasMensual;
