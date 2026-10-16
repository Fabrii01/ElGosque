import { MODALIDADES_ENVIO } from './envio';

// Formulario admin de logística y despacho (REQ-F10)
const RegistroEnvio = ({ envio, setEnvio }) => {
  const actualizar = (campo, valor) => setEnvio({ ...envio, [campo]: valor });

  return (
    <div className="border border-cafe-tostado/25 bg-cafe-tostado/5 p-5 rounded-sm">
      <h4 className="text-sm font-titulo font-semibold text-cafe-tostado uppercase mb-4 flex items-center gap-2">Logística y Despacho</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Modalidad de Entrega</label>
          <select className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg outline-none focus:ring-2 focus:ring-cafe-tostado" value={envio.modalidad} onChange={e => actualizar('modalidad', e.target.value)}>
            <option value="">-- Seleccionar --</option>
            {MODALIDADES_ENVIO.map(modalidad => <option key={modalidad}>{modalidad}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Agencia / Courier</label>
          <input type="text" className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg outline-none" value={envio.agencia} onChange={e => actualizar('agencia', e.target.value)} placeholder="Ej. Shalom, Olva, Moto 1..." />
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Fecha de Despacho</label>
          <input type="date" className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg outline-none" value={envio.fechaEnvio} onChange={e => actualizar('fechaEnvio', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Tracking / Número de Guía</label>
          <input type="text" className="w-full bg-cafe-leche border border-cafe-espresso/25 p-2 rounded-lg outline-none" value={envio.numeroGuia} onChange={e => actualizar('numeroGuia', e.target.value)} placeholder="Ej. TRU-009812" />
        </div>
      </div>
    </div>
  );
};

export default RegistroEnvio;
