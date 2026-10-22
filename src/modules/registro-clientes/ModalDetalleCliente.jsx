import { resumirProductos } from './detalleCliente';
import { colorEstado } from '../gestion-pedidos/estadoPedido';
import { formatearSoles, formatearEntero } from '../../shared/utils/formato';
import { formatearFechaCorta } from '../../shared/utils/fechas';

const Dato = ({ etiqueta, valor }) => (
  <div>
    <dt className="text-[10px] font-bold text-cafe-tostado/70 uppercase tracking-wider">{etiqueta}</dt>
    <dd className="text-sm text-cafe-espresso font-medium break-words">{valor || '—'}</dd>
  </div>
);

const Cifra = ({ etiqueta, valor, ayuda }) => (
  <div className="bg-cafe-crema border border-cafe-espresso/10 rounded-sm p-3" title={ayuda}>
    <p className="text-[10px] font-bold text-cafe-tostado/80 uppercase tracking-wider">{etiqueta}</p>
    <p className="text-lg font-titulo font-semibold text-cafe-espresso tabular-nums mt-0.5">{valor}</p>
  </div>
);

// Ficha del cliente: datos, actividad comercial e historial de pedidos (se abre con "Ver detalle")
const ModalDetalleCliente = ({ cliente, detalle, onCerrar, onAbrirPedido }) => {
  const { resumen, pedidos, productosFavoritos } = detalle;

  return (
    <div className="fixed inset-0 bg-cafe-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="titulo-cliente">
      <div className="bg-cafe-leche rounded-md w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="bg-cafe-hoja text-white p-4 sm:p-6 flex justify-between items-start gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-cafe-crema/75 uppercase tracking-wider">Ficha del cliente</p>
            <h3 id="titulo-cliente" className="text-xl sm:text-2xl font-titulo font-semibold truncate">{cliente.nombre || 'Sin nombre'}</h3>
            <p className="text-sm text-cafe-crema/85">{cliente.negocio || 'Negocio no registrado'} · {cliente.ciudad || 'Ciudad no registrada'}</p>
          </div>
          <button onClick={onCerrar} className="text-cafe-crema/85 hover:text-white font-titulo font-semibold text-xl" aria-label="Cerrar">X</button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* DATOS DE CONTACTO */}
          <section>
            <h4 className="text-sm font-bold text-cafe-espresso uppercase mb-3">Datos de contacto</h4>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Dato etiqueta="Teléfono" valor={cliente.telefono} />
              <Dato etiqueta="Correo" valor={cliente.email} />
              <Dato etiqueta="Ciudad" valor={cliente.ciudad} />
              <Dato etiqueta="Negocio" valor={cliente.negocio} />
              <Dato etiqueta="Registrado el" valor={cliente.fechaRegistro ? formatearFechaCorta(cliente.fechaRegistro) : 'Sin fecha (registro antiguo)'} />
              <Dato etiqueta="Aviso de privacidad" valor={cliente.aceptaPrivacidad ? '✓ Aceptado' : 'Sin registro de aceptación'} />
            </dl>
            {!cliente.datosCompletos && <p className="mt-3 text-xs font-bold text-cafe-tostado bg-cafe-arena/50 border border-cafe-kraft/60 rounded-lg px-3 py-2">⚠ Faltan datos obligatorios de este cliente.</p>}
          </section>

          {/* RESUMEN COMERCIAL */}
          <section>
            <h4 className="text-sm font-bold text-cafe-espresso uppercase mb-3">Resumen comercial</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Cifra etiqueta="Solicitudes" valor={formatearEntero(resumen.solicitudes)} ayuda="Todas las solicitudes registradas, en cualquier estado" />
              <Cifra etiqueta="Pedidos concretados" valor={formatearEntero(resumen.pedidosConcretados)} ayuda="Vendido, Pagado, Enviado o Entregado" />
              <Cifra etiqueta="Total comprado" valor={formatearSoles(resumen.totalComprado)} />
              <Cifra etiqueta="Ticket promedio" valor={formatearSoles(resumen.ticketPromedio)} />
              <Cifra etiqueta="Unidades" valor={formatearEntero(resumen.unidades)} />
              <Cifra etiqueta="Por cobrar" valor={formatearSoles(resumen.porCobrar)} ayuda="Ventas en estado Vendido que aún no registran pago" />
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <Dato etiqueta="Primera compra" valor={resumen.primeraCompra && formatearFechaCorta(resumen.primeraCompra)} />
              <Dato etiqueta="Última compra" valor={resumen.ultimaCompra && formatearFechaCorta(resumen.ultimaCompra)} />
              <Dato etiqueta="Pendientes / no concretados" valor={`${resumen.pendientes} / ${resumen.noConcretados}`} />
            </dl>
          </section>

          {/* PRODUCTOS FAVORITOS */}
          {productosFavoritos.length > 0 && (
            <section>
              <h4 className="text-sm font-bold text-cafe-espresso uppercase mb-3">Productos que más compra</h4>
              <ul className="space-y-2">
                {productosFavoritos.map(p => (
                  <li key={p.nombre} className="flex justify-between items-center gap-3 bg-cafe-crema rounded-sm px-3 py-2 text-sm">
                    <span className="font-bold text-cafe-espresso">{p.nombre}</span>
                    <span className="text-cafe-tostado tabular-nums">{formatearEntero(p.unidades)} und. · <span className="font-semibold text-cafe-tostado">{formatearSoles(p.importe)}</span></span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* HISTORIAL DE PEDIDOS */}
          <section>
            <h4 className="text-sm font-bold text-cafe-espresso uppercase mb-3">Historial de solicitudes y pedidos ({pedidos.length})</h4>
            {pedidos.length === 0 ? (
              <p className="text-sm text-cafe-tostado/70 italic">Este cliente aún no registra solicitudes.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead className="text-[10px] uppercase text-cafe-tostado/70 font-bold">
                    <tr><th className="text-left py-2">Código / Fecha</th><th className="text-left py-2">Productos</th><th className="text-left py-2">Estado</th><th className="text-right py-2">Total</th><th className="py-2"></th></tr>
                  </thead>
                  <tbody>
                    {pedidos.map(p => (
                      <tr key={p.id} className="border-t border-cafe-espresso/10 align-top">
                        <td className="py-2 pr-3">
                          <span className="font-bold text-cafe-hoja block">{p.codigo}</span>
                          <span className="text-xs text-cafe-tostado/80">{formatearFechaCorta(p.fecha)}{p.origen === 'Asistente IA' ? ' · Asistente IA' : ''}</span>
                        </td>
                        <td className="py-2 pr-3 text-cafe-tostado">{resumirProductos(p)}</td>
                        <td className="py-2 pr-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${colorEstado(p.estado)}`}>{p.estado}</span></td>
                        <td className="py-2 text-right font-semibold tabular-nums">{formatearSoles(p.total)}</td>
                        <td className="py-2 pl-3 text-right">
                          <button onClick={() => onAbrirPedido(p)} className="text-xs font-bold text-cafe-hoja border border-cafe-hoja/30 bg-cafe-hoja/10 hover:bg-cafe-hoja/20 px-3 py-1 rounded-full whitespace-nowrap">Abrir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCliente;
