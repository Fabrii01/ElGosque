import { useState } from 'react';
import { actualizarPedido } from './pedidosService';
import { validarTransicion, validarMotivo, crearEntradaHistorial } from './estadoPedido';
import { ESTADOS_CON_PRECIO_EDITABLE, crearProductosEditables, recalcularProductos, calcularTotalAcordado, validarProductosAcordados } from './preciosAcordados';
import GestionEstado from './GestionEstado';
import HistorialPedido from './HistorialPedido';
import ProductosAcordados from './ProductosAcordados';
import RegistroPago from '../pagos/RegistroPago';
import { crearPagoInicial, validarPago } from '../pagos/pago';
import RegistroConstancia from '../constancias/RegistroConstancia';
import RegistroEnvio from '../envios/RegistroEnvio';
import { crearEnvioInicial, validarEnvio } from '../envios/envio';
import { validarEntrega } from '../entregas/entrega';

// Modal que reúne productos acordados, estado, pago, constancia, envío y entrega de un pedido; se guarda todo junto
const ModalGestionPedido = ({ pedido, adminUser, onCerrar, onGuardado }) => {
  const estadoActual = pedido.estado || 'Pendiente';
  const preciosEditables = ESTADOS_CON_PRECIO_EDITABLE.includes(estadoActual);
  const [productos, setProductos] = useState(() => crearProductosEditables(pedido.productos));
  const [nuevoEstado, setNuevoEstado] = useState(estadoActual);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [pago, setPago] = useState(() => crearPagoInicial(pedido.datosPago));
  const [constanciaImagen, setConstanciaImagen] = useState(pedido.datosPago?.constanciaImagen || '');
  // Pedidos anteriores al cambio: nro. de operación y referencia se conservan y se muestran como información
  const constancia = pedido.datosPago?.constancia || '';
  const datosAnteriores = [
    pago.nroOperacion && `Nro. de operación ${pago.nroOperacion}`,
    constancia && `Referencia: ${constancia}`,
  ].filter(Boolean);
  const [envio, setEnvio] = useState(() => crearEnvioInicial(pedido.datosEnvio));
  const [guardando, setGuardando] = useState(false);

  const guardarCambios = async (e) => {
    e.preventDefault();
    const error = validarTransicion(estadoActual, nuevoEstado)
      || validarMotivo(nuevoEstado, motivoCancelacion)
      || (preciosEditables && validarProductosAcordados(nuevoEstado, productos))
      || validarPago(nuevoEstado, { ...pago, constanciaImagen })
      || validarEnvio(nuevoEstado, envio)
      || validarEntrega(nuevoEstado, envio, estadoActual);
    if (error) return alert(error);

    const nuevoHistorial = crearEntradaHistorial(pedido, nuevoEstado, adminUser, motivoCancelacion);
    const historialAcumulado = pedido.historial ? [...pedido.historial, nuevoHistorial] : [nuevoHistorial];
    setGuardando(true);
    try {
      await actualizarPedido(pedido.id, {
        ...(preciosEditables && { productos: recalcularProductos(productos), total: calcularTotalAcordado(productos) }),
        estado: nuevoEstado,
        historial: historialAcumulado,
        datosPago: { ...pago, constancia, constanciaImagen },
        datosEnvio: envio,
      });
      onGuardado();
    } catch (error) {
      console.error('Error al actualizar el pedido:', error);
      alert('No se pudo guardar el pedido. Revisa tu conexión e inténtalo de nuevo.');
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-cafe-espresso/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-cafe-leche rounded-md w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <div className="bg-cafe-crema p-4 sm:p-6 border-b flex justify-between items-center gap-3">
          <div className="min-w-0">
            <span className="text-xs font-bold text-cafe-tostado/70 uppercase block mb-1">{pedido.clienteNombre} · {pedido.negocio}</span>
            <h3 className="font-titulo font-semibold text-xl sm:text-2xl text-cafe-hoja break-all">{pedido.codigo}</h3>
          </div>
          <button onClick={onCerrar} className="text-cafe-tostado/70 hover:text-red-500 font-titulo font-semibold text-xl" aria-label="Cerrar">X</button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          <form id="form-actualizar-pedido" onSubmit={guardarCambios} className="space-y-6">
            <ProductosAcordados productos={productos} setProductos={setProductos} editable={preciosEditables} />

            <RegistroPago pago={pago} setPago={setPago}>
              <RegistroConstancia metodo={pago.metodo} imagen={constanciaImagen} setImagen={setConstanciaImagen} datosAnteriores={datosAnteriores} />
            </RegistroPago>

            <RegistroEnvio envio={envio} setEnvio={setEnvio} />

            <GestionEstado
              estadoActual={estadoActual}
              nuevoEstado={nuevoEstado} setNuevoEstado={setNuevoEstado}
              motivoCancelacion={motivoCancelacion} setMotivoCancelacion={setMotivoCancelacion}
            />
          </form>

          <HistorialPedido historial={pedido.historial} />
        </div>

        <div className="bg-cafe-crema p-4 sm:p-6 border-t border-cafe-espresso/10 flex justify-end gap-3">
          <button onClick={onCerrar} className="px-5 py-3 rounded-sm font-bold text-cafe-tostado hover:bg-cafe-arena">Descartar</button>
          <button type="submit" form="form-actualizar-pedido" disabled={guardando} className="px-5 py-3 rounded-sm font-bold bg-cafe-hoja text-white hover:bg-cafe-selva shadow-lg disabled:bg-cafe-kraft">{guardando ? 'Guardando...' : 'Aplicar Cambios'}</button>
        </div>
      </div>
    </div>
  );
};

export default ModalGestionPedido;
