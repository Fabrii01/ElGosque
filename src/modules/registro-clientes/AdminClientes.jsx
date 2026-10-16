import { formatearSoles } from '../../shared/utils/formato';
import { formatearFechaCorta } from '../../shared/utils/fechas';
import ModalDetalleCliente from './ModalDetalleCliente';

// Gestión de clientes registrados (alcance del producto: "el administrador podrá gestionar clientes")
const AdminClientes = ({
  clientesResumidos, clientesFiltrados, busquedaCliente, setBusquedaCliente,
  clienteSeleccionado, detalleCliente, verDetalleCliente, cerrarDetalleCliente, onAbrirPedido,
}) => {
  const completos = clientesResumidos.filter(c => c.datosCompletos).length;
  const conCompras = clientesResumidos.filter(c => c.pedidosConcretados > 0).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-cafe-leche rounded-md border border-cafe-espresso/10 p-5 shadow-sm">
          <p className="text-xs font-bold text-cafe-tostado/70 uppercase tracking-wider">Clientes registrados</p>
          <p className="text-3xl font-titulo font-semibold text-cafe-espresso mt-1">{clientesResumidos.length}</p>
        </div>
        <div className="bg-cafe-leche rounded-md border border-cafe-espresso/10 p-5 shadow-sm">
          <p className="text-xs font-bold text-cafe-tostado/70 uppercase tracking-wider">Con al menos una compra</p>
          <p className="text-3xl font-titulo font-semibold text-cafe-espresso mt-1">{conCompras}</p>
        </div>
        <div className="bg-cafe-leche rounded-md border border-cafe-espresso/10 p-5 shadow-sm">
          <p className="text-xs font-bold text-cafe-tostado/70 uppercase tracking-wider">Con datos completos</p>
          <p className="text-3xl font-titulo font-semibold text-cafe-espresso mt-1">{completos} <span className="text-base font-bold text-cafe-tostado/70">/ {clientesResumidos.length}</span></p>
        </div>
      </div>

      <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 overflow-hidden">
        <div className="p-5 md:p-6 border-b border-cafe-espresso/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <h3 className="font-bold text-lg text-cafe-espresso">Cartera de Clientes</h3>
          <input type="search" placeholder="Buscar nombre, negocio, ciudad, teléfono o correo..." className="border border-cafe-espresso/15 p-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cafe-hoja w-full md:w-80" value={busquedaCliente} onChange={e => setBusquedaCliente(e.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[960px]">
            <thead className="text-xs uppercase text-cafe-tostado/70 font-bold border-b">
              <tr>
                <th className="p-4">Cliente / Negocio</th><th className="p-4">Contacto</th><th className="p-4">Ciudad</th>
                <th className="p-4 text-right">Solicitudes</th><th className="p-4 text-right">Pedidos</th><th className="p-4 text-right">Total comprado</th><th className="p-4">Última actividad</th><th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cafe-espresso/10 text-sm">
              {clientesFiltrados.map(c => (
                <tr key={c.uid} className="hover:bg-cafe-crema">
                  <td className="p-4">
                    <span className="font-bold text-cafe-espresso block">{c.nombre || '—'}</span>
                    <span className="text-xs text-cafe-tostado/80">{c.negocio || '—'}</span>
                    {!c.datosCompletos && <span className="ml-2 text-[10px] font-bold uppercase text-cafe-cereza bg-cafe-arena/50 border border-cafe-kraft/60 px-2 py-0.5 rounded-full">⚠ Datos incompletos</span>}
                  </td>
                  <td className="p-4">
                    <span className="block text-cafe-tostado">{c.telefono || '—'}</span>
                    <span className="text-xs text-cafe-tostado/80">{c.email || '—'}</span>
                  </td>
                  <td className="p-4 text-cafe-tostado">{c.ciudad || '—'}</td>
                  <td className="p-4 text-right tabular-nums">{c.solicitudes}</td>
                  <td className="p-4 text-right tabular-nums">{c.pedidosConcretados}</td>
                  <td className="p-4 text-right font-bold text-cafe-tostado tabular-nums">{formatearSoles(c.totalComprado)}</td>
                  <td className="p-4 text-cafe-tostado/80">{c.ultimaActividad ? formatearFechaCorta(c.ultimaActividad) : 'Sin actividad'}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => verDetalleCliente(c)} className="text-xs font-bold text-white bg-cafe-hoja hover:bg-cafe-selva px-3 py-1.5 rounded-full whitespace-nowrap">Ver detalle</button>
                  </td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-cafe-tostado/70 italic">No se encontraron clientes.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {clienteSeleccionado && detalleCliente && (
        <ModalDetalleCliente
          cliente={clienteSeleccionado}
          detalle={detalleCliente}
          onCerrar={cerrarDetalleCliente}
          onAbrirPedido={onAbrirPedido}
        />
      )}
    </div>
  );
};

export default AdminClientes;
