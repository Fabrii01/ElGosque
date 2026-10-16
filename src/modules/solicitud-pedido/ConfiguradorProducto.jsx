import { presentacionesDisponibles } from './solicitud';

// Modal para elegir presentación, peso y cantidad antes de agregar al pedido
const ConfiguradorProducto = ({ productoConfig, setProductoConfig, onSubmit }) => (
  <div className="fixed inset-0 bg-cafe-espresso/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
    <div className="bg-cafe-leche rounded-md p-8 max-w-sm w-full relative shadow-xl border-t-8 border-cafe-hoja">
      <button onClick={() => setProductoConfig(null)} className="absolute top-6 right-6 text-cafe-tostado/70 hover:text-cafe-espresso">X</button>
      <h3 className="font-titulo text-2xl font-semibold text-cafe-espresso mb-4">{productoConfig.nombre}</h3>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Presentación</label>
          <select className="w-full bg-cafe-crema border p-3 rounded-sm outline-none" value={productoConfig.presentacionElegida} onChange={e => setProductoConfig({...productoConfig, presentacionElegida: e.target.value})}>
            {presentacionesDisponibles(productoConfig).map(presentacion => <option key={presentacion}>{presentacion}</option>)}
          </select>
        </div>
        <div>
          {/* El precio referencial corresponde a este peso; otros pesos se registran como otro producto (REQ-F03-03) */}
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Peso / Formato</label>
          <p className="w-full bg-cafe-arena/60 border p-3 rounded-sm text-cafe-tostado font-semibold">{productoConfig.pesoElegido}</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Cantidad de unidades</label>
          <input type="number" min="1" className="w-full bg-cafe-crema border p-3 rounded-sm outline-none" value={productoConfig.cantidad} onChange={e => setProductoConfig({...productoConfig, cantidad: e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10) || 1)})} required/>
        </div>
        <p className="text-right text-lg font-bold text-cafe-hoja">Subtotal: S/ {(productoConfig.precioReferencial * productoConfig.cantidad).toFixed(2)}</p>
        <button type="submit" className="w-full bg-cafe-hoja text-white font-bold py-3 rounded-sm">Añadir al Carrito</button>
      </form>
    </div>
  </div>
);

export default ConfiguradorProducto;
