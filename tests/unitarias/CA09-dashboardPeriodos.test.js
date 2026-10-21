import { describe, it, expect } from 'vitest';
import {
  calcularKpis, calcularIngresosPorMes, resolverRango, filtrarPorRango, variacion, obtenerMesesDisponibles, calcularTablero,
} from '../../src/modules/dashboard/estadisticas';

// CA09 - Dashboard: indicadores, periodos y series (estadisticas.js) | REQ-F11-01, REQ-F11-02, REQ-F11-08
// Fechas a mitad de mes (día 15, 12:00) para no depender de la zona horaria; formato Timestamp de Firestore
const fecha = (anio, mes, dia = 15) => ({ seconds: new Date(anio, mes - 1, dia, 12).getTime() / 1000 });
const pedido = (estado, total, f, extra = {}) => ({ clienteId: 'u1', estado, total, fecha: f, ...extra });
const julio = pedido('Vendido', 100, fecha(2026, 7));
const septiembre = pedido('Vendido', 200, fecha(2026, 9));

describe('CA09 - Dashboard: indicadores, periodos y series (estadisticas.js)', () => {
  it('1.0 [+] Indicadores de ventas', () => {
    const kpis = calcularKpis([
      pedido('Vendido', 100, fecha(2026, 9)),
      pedido('Pagado', 200, fecha(2026, 9)),
      pedido('Entregado', 300, fecha(2026, 9), { productos: [{ cantidad: 2 }] }),
      pedido('Pendiente', 50, fecha(2026, 9)),
    ]);
    expect(kpis).toMatchObject({ ingresos: 600, pedidosConcretados: 3, ticketPromedio: 200, solicitudes: 4, tasaConversion: 0.75 });
  });

  it('2.0 [–] Indicadores sin pedidos', () => {
    const kpis = calcularKpis([]);
    expect(kpis.ingresos).toBe(0);
    expect(kpis.ticketPromedio).toBe(0);
    expect(kpis.tasaConversion).toBeNull();
  });

  it('3.0 [+] Serie mensual continua', () => {
    const serie = calcularIngresosPorMes([julio, septiembre]);
    expect(serie.map(m => m.clave)).toEqual(['2026-07', '2026-08', '2026-09']);
    expect(serie.map(m => m.ingresos)).toEqual([100, 0, 200]);
  });

  it('4.0 [–] Serie mensual sin ventas', () => {
    expect(calcularIngresosPorMes([])).toEqual([]);
  });

  it('5.0 [+] Periodo de un mes', () => {
    const rango = resolverRango('mes:2026-09');
    expect(rango.desde).toEqual(new Date(2026, 8, 1));
    expect(rango.hasta).toEqual(new Date(2026, 8, 30, 23, 59, 59, 999));
    expect(rango.anterior.desde).toEqual(new Date(2026, 7, 1));
    expect(rango.anterior.hasta).toEqual(new Date(2026, 7, 31, 23, 59, 59, 999));
  });

  it('6.0 [+] Últimos 30 días', () => {
    const rango = resolverRango('30d', {}, new Date(2026, 9, 17, 15, 0));
    expect(rango.desde).toEqual(new Date(2026, 8, 18));
    expect(rango.hasta).toEqual(new Date(2026, 9, 17, 23, 59, 59, 999));
  });

  it('7.0 [+] Rango personalizado con fechas invertidas', () => {
    const rango = resolverRango('rango', { desde: '2026-10-20', hasta: '2026-10-05' });
    expect(rango.desde).toEqual(new Date(2026, 9, 5));
    expect(rango.hasta).toEqual(new Date(2026, 9, 20, 23, 59, 59, 999));
  });

  it('8.0 [–] Rango personalizado incompleto', () => {
    expect(resolverRango('rango', {})).toMatchObject({ desde: null, hasta: null });
    expect(resolverRango('todo')).toMatchObject({ desde: null, hasta: null });
  });

  it('9.0 [+] Filtrar pedidos por rango', () => {
    expect(filtrarPorRango([julio, septiembre], resolverRango('mes:2026-09'))).toEqual([septiembre]);
  });

  it('10.0 [–] Pedido sin fecha en el rango', () => {
    expect(filtrarPorRango([pedido('Vendido', 100, undefined)], resolverRango('mes:2026-09'))).toEqual([]);
  });

  it('11.0 [+] Variación frente al periodo anterior', () => {
    expect(variacion(150, 100)).toBe(0.5);
  });

  it('12.0 [–] Variación sin periodo anterior', () => {
    expect(variacion(50, 0)).toBeNull();
  });

  it('13.0 [+] Meses disponibles', () => {
    expect(obtenerMesesDisponibles([julio, septiembre]).map(m => m.valor)).toEqual(['mes:2026-09', 'mes:2026-07']);
  });

  it('14.0 [+] Tablero con datos', () => {
    expect(calcularTablero([septiembre], [], resolverRango('mes:2026-09')).hayDatos).toBe(true);
  });

  it('15.0 [–] Tablero sin datos para el filtro', () => {
    expect(calcularTablero([septiembre], [], resolverRango('mes:2026-01')).hayDatos).toBe(false);
  });
});
