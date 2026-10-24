import TarjetaKpi from './graficos/TarjetaKpi';
import TarjetaGrafico from './graficos/TarjetaGrafico';
import GraficoColumnasMensual from './graficos/GraficoColumnasMensual';
import GraficoBarrasHorizontales from './graficos/GraficoBarrasHorizontales';
import GraficoVariedades from './graficos/GraficoVariedades';
import BarraProporcion from './graficos/BarraProporcion';
import MedidorIndicador from './graficos/MedidorIndicador';
import { COLOR_ATENUADO } from './graficos/colores';
import { variacion } from './estadisticas';
import { formatearSoles, formatearSolesCorto, formatearEntero, formatearPorcentaje } from '../../shared/utils/formato';
import GranoCafe from '../../shared/components/portal/GranoCafe';

const ESTADOS_ATENUADOS = ['Cancelado'];
const SinVentas = () => <p className="text-sm text-cafe-tostado/70 italic py-8 text-center">Sin ventas concretadas en este periodo.</p>;

const DashboardBI = ({
  periodo, setPeriodo, rangoPersonalizado, setRangoPersonalizado, opcionesPeriodo, etiquetaPeriodo,
  tablero, exportarPedidos, exportarClienteProducto,
}) => {
  const { kpis, kpisAnteriores: ant } = tablero;
  const hayVentas = kpis.pedidosConcretados > 0;
  const delta = (campo) => (ant ? variacion(kpis[campo], ant[campo]) : null);
  const predefinidos = opcionesPeriodo.filter(o => !o.valor.startsWith('mes:'));
  const meses = opcionesPeriodo.filter(o => o.valor.startsWith('mes:'));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ENCABEZADO Y FILTROS (una sola fila sobre los gráficos) */}
      <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-4 sm:p-5 md:p-6 flex flex-col lg:flex-row justify-between lg:items-end gap-4 min-w-0">
        <div>
          <h3 className="font-bold text-2xl text-cafe-espresso">Inteligencia Comercial</h3>
          <p className="text-sm text-cafe-tostado/80">Ventas = pedidos en Pagado, Enviado o Vendido, según la fecha de registro de la solicitud.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-bold text-cafe-tostado/80 uppercase tracking-wider">
            Periodo
            <select className="block mt-1 border border-cafe-espresso/15 p-2.5 rounded-sm text-sm font-bold bg-cafe-crema text-cafe-espresso normal-case tracking-normal outline-none focus:ring-2 focus:ring-cafe-hoja" value={periodo} onChange={e => setPeriodo(e.target.value)}>
              {predefinidos.map(o => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
              {meses.length > 0 && (
                <optgroup label="Por mes">
                  {meses.map(o => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
                </optgroup>
              )}
            </select>
          </label>
          {periodo === 'rango' && (
            <>
              <label className="text-xs font-bold text-cafe-tostado/80 uppercase tracking-wider">Desde
                <input type="date" className="block mt-1 border border-cafe-espresso/15 p-2 rounded-sm text-sm bg-cafe-crema text-cafe-espresso" value={rangoPersonalizado.desde} onChange={e => setRangoPersonalizado({ ...rangoPersonalizado, desde: e.target.value })} />
              </label>
              <label className="text-xs font-bold text-cafe-tostado/80 uppercase tracking-wider">Hasta
                <input type="date" className="block mt-1 border border-cafe-espresso/15 p-2 rounded-sm text-sm bg-cafe-crema text-cafe-espresso" value={rangoPersonalizado.hasta} onChange={e => setRangoPersonalizado({ ...rangoPersonalizado, hasta: e.target.value })} />
              </label>
            </>
          )}
          <button onClick={exportarPedidos} disabled={!tablero.hayDatos} className="bg-cafe-hoja hover:bg-cafe-selva disabled:bg-cafe-kraft text-white text-sm font-bold px-4 py-2.5 rounded-sm transition">
            ⬇ Exportar pedidos (Excel)
          </button>
        </div>
      </div>

      {periodo === 'rango' && (!rangoPersonalizado.desde || !rangoPersonalizado.hasta) && (
        <p className="text-sm text-cafe-tostado bg-cafe-arena/50 border border-cafe-kraft/60 rounded-sm p-3">Elige las dos fechas del rango. Mientras tanto se muestra todo el historial.</p>
      )}

      {!tablero.hayDatos ? (
        /* REQ-F11-08 */
        <div className="bg-cafe-arena/50 rounded-md p-12 text-center border border-cafe-kraft/40">
          <GranoCafe className="w-10 h-12 mx-auto mb-4 text-cafe-kraft" />
          <h3 className="text-xl font-bold text-cafe-tostado mb-2">No hay datos para el filtro seleccionado.</h3>
          <p className="text-cafe-cereza">No se registraron solicitudes ni pedidos en «{etiquetaPeriodo}».</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            <TarjetaKpi destacado titulo="Ingresos" valor={formatearSoles(kpis.ingresos)} variacion={delta('ingresos')} />
            <TarjetaKpi titulo="Ventas concretadas" valor={formatearEntero(kpis.pedidosConcretados)} variacion={delta('pedidosConcretados')} />
            <TarjetaKpi titulo="Ticket promedio" valor={formatearSoles(kpis.ticketPromedio)} variacion={delta('ticketPromedio')} />
            <TarjetaKpi titulo="Unidades vendidas" valor={formatearEntero(kpis.unidades)} variacion={delta('unidades')} />
            <TarjetaKpi titulo="Clientes compradores" valor={formatearEntero(kpis.clientesCompradores)} variacion={delta('clientesCompradores')} />
            <TarjetaKpi
              titulo="Conversión"
              ayuda="Ventas concretadas ÷ solicitudes registradas en el periodo (incluye las pendientes)"
              valor={kpis.tasaConversion === null ? '—' : formatearPorcentaje(kpis.tasaConversion)}
              variacion={ant && ant.tasaConversion !== null && kpis.tasaConversion !== null ? variacion(kpis.tasaConversion, ant.tasaConversion) : null}
            />
          </div>

          {/* TENDENCIA Y FLUJO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TarjetaGrafico
              className="lg:col-span-2"
              titulo="Ingresos por mes"
              descripcion="Comparación mensual en orden cronológico (REQ-F11-02)."
              tabla={{
                columnas: [{ titulo: 'Mes', valor: m => m.mesLargo }, { titulo: 'Pedidos', valor: m => m.pedidos, numerico: true }, { titulo: 'Ingresos', valor: m => formatearSoles(m.ingresos), numerico: true }],
                filas: tablero.ingresosPorMes,
              }}
            >
              {hayVentas ? <GraficoColumnasMensual datos={tablero.ingresosPorMes} /> : <SinVentas />}
            </TarjetaGrafico>

            <TarjetaGrafico titulo="Solicitudes por estado" descripcion="Cuántas solicitudes hay en cada fase del flujo. Gris: no se concretaron.">
              <GraficoBarrasHorizontales
                datos={tablero.embudo.map(e => ({ ...e, color: ESTADOS_ATENUADOS.includes(e.nombre) ? COLOR_ATENUADO : undefined }))}
                formatear={formatearEntero}
                nombreSerie="Solicitudes"
                anchoEtiquetas={86}
              />
            </TarjetaGrafico>
          </div>

          {/* PRODUCTO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TarjetaGrafico
              className="lg:col-span-2"
              titulo="Variedades: solicitadas vs. vendidas"
              descripcion="Unidades pedidas en todas las solicitudes frente a las que terminaron en venta (REQ-F11-05)."
              tabla={{
                columnas: [{ titulo: 'Variedad', valor: v => v.nombre }, { titulo: 'Solicitadas', valor: v => formatearEntero(v.solicitadas), numerico: true }, { titulo: 'Vendidas', valor: v => formatearEntero(v.vendidas), numerico: true }],
                filas: tablero.variedades,
              }}
            >
              <GraficoVariedades datos={tablero.variedades} />
            </TarjetaGrafico>

            <div className="flex flex-col gap-6 min-w-0">
              <TarjetaGrafico titulo="Grano vs. molido" descripcion="Unidades vendidas por presentación (REQ-F11-04).">
                <BarraProporcion unidad="und." partes={[{ nombre: 'En grano', valor: tablero.presentaciones.enGrano }, { nombre: 'Molido', valor: tablero.presentaciones.molido }]} />
              </TarjetaGrafico>
              <TarjetaGrafico titulo="Canal de las solicitudes" descripcion="Registradas desde el catálogo web o por el asistente IA.">
                <BarraProporcion unidad="solicitudes" partes={[{ nombre: 'Web', valor: tablero.canales.web }, { nombre: 'Asistente IA', valor: tablero.canales.ia }]} />
              </TarjetaGrafico>
            </div>
          </div>

          {/* LOGÍSTICA (REQ-F11-07) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TarjetaGrafico
              titulo="Ventas por ciudad"
              descripcion="Ingresos en soles por ciudad de destino."
              tabla={{ columnas: [{ titulo: 'Ciudad', valor: c => c.nombre }, { titulo: 'Pedidos', valor: c => c.pedidos, numerico: true }, { titulo: 'Ingresos', valor: c => formatearSoles(c.ingresos), numerico: true }], filas: tablero.ciudades }}
            >
              {hayVentas ? (
                <GraficoBarrasHorizontales
                  datos={tablero.ciudades.map(c => ({ nombre: c.nombre, valor: c.ingresos, detalle: `${c.pedidos} pedidos` }))}
                  formatear={formatearSoles} formatearEje={formatearSolesCorto} nombreSerie="Ingresos"
                />
              ) : <SinVentas />}
            </TarjetaGrafico>

            <TarjetaGrafico
              titulo="Ventas por modalidad de entrega"
              descripcion="Ingresos en soles según cómo se despachó el pedido."
              tabla={{ columnas: [{ titulo: 'Modalidad', valor: c => c.nombre }, { titulo: 'Pedidos', valor: c => c.pedidos, numerico: true }, { titulo: 'Ingresos', valor: c => formatearSoles(c.ingresos), numerico: true }], filas: tablero.modalidades }}
            >
              {hayVentas ? (
                <GraficoBarrasHorizontales
                  datos={tablero.modalidades.map(c => ({ nombre: c.nombre, valor: c.ingresos, detalle: `${c.pedidos} pedidos` }))}
                  formatear={formatearSoles} formatearEje={formatearSolesCorto} nombreSerie="Ingresos" anchoEtiquetas={150}
                />
              ) : <SinVentas />}
            </TarjetaGrafico>
          </div>

          {/* CLIENTES (REQ-F11-03 y REQ-F11-06) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TarjetaGrafico
              titulo="Top 10 clientes mayoristas"
              descripcion="Clientes con mayores compras en el periodo."
              tabla={{
                columnas: [{ titulo: 'Cliente', valor: c => c.nombre }, { titulo: 'Negocio', valor: c => c.negocio }, { titulo: 'Pedidos', valor: c => c.pedidos, numerico: true }, { titulo: 'Unidades', valor: c => formatearEntero(c.unidades), numerico: true }, { titulo: 'Compras', valor: c => formatearSoles(c.ingresos), numerico: true }],
                filas: tablero.topClientes,
              }}
            >
              {hayVentas ? (
                <GraficoBarrasHorizontales
                  datos={tablero.topClientes.map(c => ({ nombre: c.nombre, valor: c.ingresos, detalle: `${c.negocio} · ${c.pedidos} pedidos · ${formatearEntero(c.unidades)} und.` }))}
                  formatear={formatearSoles} formatearEje={formatearSolesCorto} nombreSerie="Compras"
                />
              ) : <SinVentas />}
            </TarjetaGrafico>

            <TarjetaGrafico
              titulo="Ventas por cliente y producto"
              descripcion="Unidades e ingresos de cada producto vendido a cada cliente."
              acciones={hayVentas && <button onClick={exportarClienteProducto} className="text-xs font-bold text-cafe-hoja border border-cafe-hoja/30 bg-cafe-hoja/10 hover:bg-cafe-hoja/20 px-3 py-1.5 rounded-full">⬇ Excel</button>}
            >
              {hayVentas ? (
                <div className="overflow-auto max-h-[22rem] -mx-1">
                  <table className="w-full text-sm min-w-[460px]">
                    <thead className="text-[10px] uppercase text-cafe-tostado/70 font-bold sticky top-0 bg-cafe-leche">
                      <tr><th className="text-left py-2 px-1">Cliente</th><th className="text-left py-2 px-1">Producto</th><th className="text-right py-2 px-1">Unidades</th><th className="text-right py-2 px-1">Ingresos</th></tr>
                    </thead>
                    <tbody>
                      {tablero.clienteProducto.map((f, i) => (
                        <tr key={i} className="border-t border-cafe-espresso/10">
                          <td className="py-2 px-1"><span className="font-bold text-cafe-espresso block">{f.cliente}</span><span className="text-xs text-cafe-tostado/80">{f.negocio}</span></td>
                          <td className="py-2 px-1 text-cafe-tostado">{f.producto}<span className="text-xs text-cafe-tostado/70 block">{f.presentacion}</span></td>
                          <td className="py-2 px-1 text-right tabular-nums">{formatearEntero(f.unidades)}</td>
                          <td className="py-2 px-1 text-right tabular-nums font-semibold text-cafe-tostado">{formatearSoles(f.ingresos)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <SinVentas />}
            </TarjetaGrafico>
          </div>

          {/* INDICADORES DE LA TESIS: metas a evaluar */}
          <div>
            <h4 className="font-bold text-cafe-espresso text-sm uppercase tracking-wider mb-1">Indicadores de gestión (metas de la investigación)</h4>
            <p className="text-xs text-cafe-tostado/80 mb-4">Valores medidos con los datos del periodo; la línea vertical marca la meta.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MedidorIndicador
                titulo="Pedidos con pago y envío registrados"
                indicador={tablero.indicadores.respaldoPedidos}
                definicion="Ventas concretadas con medio, monto, fecha y comprobante de pago (captura; en pedidos anteriores, constancia o nro. de operación), y datos de envío."
              />
              <MedidorIndicador
                titulo="Integridad de datos de clientes"
                indicador={tablero.indicadores.integridadClientes}
                definicion="Clientes registrados con nombre, negocio, ciudad, teléfono y correo (todos los clientes, no depende del periodo)."
              />
              <MedidorIndicador
                titulo="Integridad de solicitudes"
                indicador={tablero.indicadores.integridadPedidos}
                definicion="Solicitudes del periodo con teléfono, ciudad, negocio y cantidades válidas en todos sus productos."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardBI;
