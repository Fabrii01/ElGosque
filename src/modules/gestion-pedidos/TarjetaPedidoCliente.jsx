import { colorEstado, motivoDelEstado } from './estadoPedido';
import DatosEnvioCliente from '../envios/DatosEnvioCliente';
import { formatearFechaCorta } from '../../shared/utils/fechas';
import { formatearSoles } from '../../shared/utils/formato';

// Tarjeta de un pedido o solicitud en la vista del cliente (REQ-F07-03/05)
const TarjetaPedidoCliente = ({ pedido }) => {
  const esSolicitud = pedido.estado === 'Pendiente';
  const motivo = motivoDelEstado(pedido);

  return (
    <div className="bg-cafe-leche rounded-md p-5 md:p-8 border border-cafe-espresso/10 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-cafe-espresso/10 pb-4 mb-4 gap-4">
        <div className="min-w-0">
          <span className="text-sm font-bold text-cafe-tostado/70 uppercase tracking-wider block mb-1">{esSolicitud ? 'Código de Solicitud' : 'Código de Pedido'}</span>
          <span className="text-xl md:text-2xl font-titulo font-semibold text-cafe-hoja break-all">{pedido.codigo}</span>
          <span className="text-sm text-cafe-tostado/80 block md:inline md:ml-4">{formatearFechaCorta(pedido.fecha)}</span>
        </div>
        <div className="flex flex-col md:items-end gap-2">
          <span className={`self-start md:self-auto px-4 py-1.5 rounded-full text-sm font-bold border ${colorEstado(pedido.estado)}`}>
            Estado: {esSolicitud ? 'En revisión' : pedido.estado}
          </span>
          <span className="text-xl font-titulo font-semibold text-cafe-tostado">
            {esSolicitud ? 'Total referencial' : 'Total'}: {formatearSoles(pedido.total)}
          </span>
        </div>
      </div>

      {motivo && (
        <p className="mb-4 bg-red-50 border border-red-100 text-red-800 text-sm p-3 rounded-sm"><span className="font-bold">Motivo:</span> {motivo}</p>
      )}

      <div className="mb-6">
        <h4 className="text-sm font-bold text-cafe-espresso uppercase mb-3">Productos Solicitados</h4>
        <ul className="space-y-3">
          {pedido.productos?.map((prod, idx) => (
            <li key={idx} className="flex justify-between items-center gap-3 bg-cafe-crema p-3 rounded-sm">
              <div>
                <span className="font-bold text-cafe-espresso">{prod.cantidad}x {prod.nombre}</span>
                <span className="text-xs text-cafe-tostado/80 block">{[prod.presentacion, prod.peso].filter(Boolean).join(' | ')}</span>
              </div>
              <span className="font-semibold text-cafe-tostado whitespace-nowrap">{formatearSoles(prod.subtotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      {!esSolicitud && <DatosEnvioCliente datosEnvio={pedido.datosEnvio} />}
    </div>
  );
};

export default TarjetaPedidoCliente;
