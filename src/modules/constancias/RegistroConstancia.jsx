// Referencia o URL de la constancia de pago (REQ-F09-03/05); se guarda en pedido.datosPago.constancia
const RegistroConstancia = ({ constancia, setConstancia }) => (
  <div className="md:col-span-2">
    <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Referencia / URL Constancia</label>
    <input type="text" className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg outline-none" value={constancia} onChange={e => setConstancia(e.target.value)} placeholder="Enlace a captura o ubicación de la constancia" />
  </div>
);

export default RegistroConstancia;
