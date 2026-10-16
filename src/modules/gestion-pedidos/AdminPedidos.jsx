import { ESTADOS_PEDIDO } from '../../shared/constants';
import { formatearFechaHora } from '../../shared/utils/fechas';
import { colorEstado } from './estadoPedido';

const AdminPedidos = ({
  filtroEstado, setFiltroEstado, busquedaPedido, setBusquedaPedido,
  pedidosVisibles, mostrarMas, pedidosFiltrados, solicitudesPorConfirmar, pedidosConfirmados,
  setPedidoSeleccionado,
}) => (
  <div className="space-y-8 max-w-7xl mx-auto">
    <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
       <div><h3 className="font-bold text-lg text-cafe-espresso">Búsqueda Logística</h3></div>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <input type="text" placeholder="Buscar código, cliente o negocio..." className="border border-cafe-espresso/15 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cafe-hoja w-full sm:w-64" value={busquedaPedido} onChange={e => setBusquedaPedido(e.target.value)} />
        <select className="border border-cafe-espresso/15 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cafe-hoja w-full sm:w-auto" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
          <option>Todos</option>
          {ESTADOS_PEDIDO.map(estado => <option key={estado}>{estado}</option>)}
        </select>
      </div>
    </div>

    {/* TABLA 1: SOLICITUDES PENDIENTES */}
    <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 overflow-hidden">
      <div className="p-6 border-b border-cafe-kraft/40 bg-cafe-arena/50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-cafe-tostado">Cotizaciones (Pendientes)</h3>
          <p className="text-xs text-cafe-cereza">Requerimientos por analizar.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-cafe-leche text-xs uppercase text-cafe-tostado/70 font-bold border-b">
            <tr><th className="p-4">Registro</th><th className="p-4">Cliente / B2B</th><th className="p-4">Estado</th><th className="p-4 text-center">Acción</th></tr>
          </thead>
          <tbody className="divide-y divide-cafe-espresso/10">
            {solicitudesPorConfirmar.slice(0, pedidosVisibles).map(pedido => (
              <tr key={pedido.id} className="hover:bg-cafe-crema">
                <td className="p-4"><span className="font-titulo font-semibold text-cafe-hoja block">{pedido.codigo}</span><span className="text-xs text-cafe-tostado/80">{formatearFechaHora(pedido.fecha)}</span></td>
                <td className="p-4"><span className="font-bold text-cafe-espresso block">{pedido.clienteNombre}</span><span className="text-xs text-cafe-tostado/80">{pedido.negocio}</span></td>
                <td className="p-4"><span className="px-3 py-1 rounded-full text-[10px] font-bold border border-yellow-200 bg-yellow-50 text-yellow-700 uppercase tracking-widest">Solicitud</span></td>
                <td className="p-4 text-center"><button onClick={() => setPedidoSeleccionado(pedido)} className="bg-cafe-mostaza hover:bg-cafe-kraft text-cafe-espresso px-4 py-2 rounded-sm text-xs font-bold transition shadow-sm">Atender</button></td>
              </tr>
            ))}
            {solicitudesPorConfirmar.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-cafe-tostado/70 italic">No hay cotizaciones pendientes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    {/* TABLA 2: PEDIDOS EN FIRME */}
    <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 overflow-hidden">
      <div className="p-6 border-b border-cafe-hoja/20 bg-cafe-hoja flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg text-white">Órdenes Activas</h3>
          <p className="text-xs text-cafe-crema/85">Transacciones en curso logístico.</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-cafe-leche text-xs uppercase text-cafe-tostado/70 font-bold border-b">
            <tr><th className="p-4">Tracking</th><th className="p-4">Cliente</th><th className="p-4">Acuerdo</th><th className="p-4">Situación</th><th className="p-4 text-center">Panel</th></tr>
          </thead>
          <tbody className="divide-y divide-cafe-espresso/10">
            {pedidosConfirmados.slice(0, pedidosVisibles).map(pedido => (
              <tr key={pedido.id} className="hover:bg-cafe-crema">
                <td className="p-4"><span className="font-titulo font-semibold text-cafe-espresso block">{pedido.codigo}</span><span className="text-xs text-cafe-tostado/80">{formatearFechaHora(pedido.fecha)}</span></td>
                <td className="p-4"><span className="font-bold text-cafe-espresso block">{pedido.clienteNombre}</span><span className="text-xs text-cafe-tostado/80">{pedido.negocio}</span></td>
                <td className="p-4 font-titulo font-semibold text-cafe-tostado">S/ {pedido.total?.toFixed(2)}</td>
                <td className="p-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${colorEstado(pedido.estado)}`}>{pedido.estado}</span></td>
                <td className="p-4 text-center"><button onClick={() => setPedidoSeleccionado(pedido)} className="border border-cafe-espresso/25 hover:bg-cafe-espresso hover:text-white hover:border-cafe-espresso text-cafe-tostado px-4 py-2 rounded-sm text-xs font-bold transition">Operar</button></td>
              </tr>
            ))}
             {pedidosConfirmados.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-cafe-tostado/70 italic">No se encontraron órdenes.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>

    {pedidosFiltrados.length > pedidosVisibles && (
        <div className="text-center mt-4">
          <button onClick={mostrarMas} className="bg-cafe-leche border border-cafe-espresso/15 hover:bg-cafe-crema text-cafe-tostado shadow-sm font-bold py-3 px-8 rounded-sm transition">
            Cargar más registros históricos
          </button>
        </div>
    )}
  </div>
);

export default AdminPedidos;
