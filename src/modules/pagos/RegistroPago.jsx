import { METODOS_PAGO } from './pago';

// Medio, monto, fecha y nro. de operación (REQ-F09-01/02); children = campos adicionales (constancia)
const RegistroPago = ({ pago, setPago, children }) => {
  const actualizar = (campo, valor) => setPago({ ...pago, [campo]: valor });

  return (
    <div className="border border-cafe-hoja/25 bg-cafe-hoja/5 p-5 rounded-sm">
      <h4 className="text-sm font-titulo font-semibold text-cafe-hoja uppercase mb-4 flex items-center gap-2">Conciliación de Pago</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Medio de Pago</label>
          <select className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg outline-none focus:ring-2 focus:ring-cafe-hoja" value={pago.metodo} onChange={e => actualizar('metodo', e.target.value)}>
            <option value="">-- Seleccionar --</option>
            {METODOS_PAGO.map(metodo => <option key={metodo}>{metodo}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Monto Pagado (S/)</label>
          <input type="number" step="0.10" className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg outline-none" value={pago.monto} onChange={e => actualizar('monto', e.target.value)} placeholder="Ej. 150.00" />
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Fecha de Pago</label>
          <input type="date" className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg outline-none" value={pago.fecha} onChange={e => actualizar('fecha', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Nro. de Operación</label>
          <input type="text" className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg outline-none" value={pago.nroOperacion} onChange={e => actualizar('nroOperacion', e.target.value)} placeholder="Ej. 984523" />
        </div>
        {children}
      </div>
    </div>
  );
};

export default RegistroPago;
