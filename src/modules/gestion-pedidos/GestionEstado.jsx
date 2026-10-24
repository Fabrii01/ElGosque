import { estadosDisponibles } from './estadoPedido';

// Cambio de estado y motivo de cancelación (REQ-F08-04/07)
// Solo se ofrecen los estados a los que se puede pasar desde el estado actual
const GestionEstado = ({ estadoActual, nuevoEstado, setNuevoEstado, motivoCancelacion, setMotivoCancelacion }) => (
  <>
    <div className="bg-cafe-crema p-4 rounded-sm border border-cafe-espresso/15">
      <label className="block text-xs font-bold text-cafe-espresso uppercase mb-2">Actualizar Fase <span className="font-normal normal-case text-cafe-tostado/80">(actual: {estadoActual})</span></label>
      <select className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg font-bold outline-none text-lg" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
        {estadosDisponibles(estadoActual).map(estado => <option key={estado}>{estado}</option>)}
      </select>
    </div>

    {nuevoEstado === 'Cancelado' && (
      <div>
        <label className="block text-xs font-bold text-red-700 uppercase mb-2">Sustento Operativo (Obligatorio)</label>
        <input type="text" className="w-full border border-red-300 p-3 rounded-lg outline-none bg-red-50" value={motivoCancelacion} onChange={e => setMotivoCancelacion(e.target.value)} />
      </div>
    )}
  </>
);

export default GestionEstado;
