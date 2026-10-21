import { VARIEDADES_CAFE } from '../../shared/constants';
import { presentacionesDisponibles, ajustarPresentacion } from '../solicitud-pedido/solicitud';
import ModalEliminarProducto from './ModalEliminarProducto';

const AdminCatalogo = ({
  productos, nuevoProducto, setNuevoProducto, idEdicion, imagenArchivo, setImagenArchivo, subiendoImg,
  guardarProducto, editarProducto, cancelarEdicion, toggleActivo,
  productoAEliminar, setProductoAEliminar, eliminando, confirmarEliminacion,
}) => (
  <div className="space-y-8 max-w-5xl mx-auto">
    <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-5 md:p-8">
      <h3 className="font-bold text-2xl text-cafe-espresso mb-6">{idEdicion ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h3>

      <form onSubmit={guardarProducto} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Variedad</label>
          <select className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm focus:ring-2 focus:ring-cafe-hoja outline-none" value={nuevoProducto.nombre} onChange={e => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}>
            {VARIEDADES_CAFE.map(variedad => <option key={variedad}>{variedad}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Precio Ref. (S/)</label>
          <input type="number" step="0.10" required className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevoProducto.precioReferencial} onChange={e => setNuevoProducto({...nuevoProducto, precioReferencial: e.target.value})}/>
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Tipo</label>
          <select className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevoProducto.tipo} onChange={e => setNuevoProducto(ajustarPresentacion({...nuevoProducto, tipo: e.target.value}))}><option>Tostado</option><option>Verde</option></select>
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Presentación</label>
          <select className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevoProducto.presentacion} onChange={e => setNuevoProducto({...nuevoProducto, presentacion: e.target.value})}>
            {presentacionesDisponibles(nuevoProducto).map(presentacion => <option key={presentacion}>{presentacion}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Peso</label>
          <input type="text" required className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevoProducto.peso} onChange={e => setNuevoProducto({...nuevoProducto, peso: e.target.value})} placeholder="Ej. 1kg"/>
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-1">Descripción</label>
          <input type="text" required className="w-full bg-cafe-crema border border-cafe-espresso/15 p-3 rounded-sm outline-none" value={nuevoProducto.descripcion} onChange={e => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}/>
        </div>

        <div className="md:col-span-2 bg-cafe-leche border border-cafe-espresso/15 p-4 rounded-sm mt-2">
          <label className="block text-xs font-bold text-cafe-tostado uppercase mb-2">Imagen del Producto (se optimiza automáticamente)</label>
          <input type="file" accept="image/*" onChange={(e) => setImagenArchivo(e.target.files[0])} className="w-full text-sm text-cafe-tostado/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-cafe-hoja/10 file:text-cafe-hoja hover:file:bg-green-100 transition" />
          {nuevoProducto.imagenUrl && !imagenArchivo && <p className="text-xs text-cafe-cereza mt-2 font-bold">Este producto ya tiene una imagen guardada.</p>}
        </div>

        <div className="md:col-span-2 mt-4 flex gap-4">
          <button type="submit" disabled={subiendoImg} className="bg-cafe-hoja text-white font-bold py-3 px-8 rounded-sm disabled:bg-cafe-kraft">{subiendoImg ? 'Procesando...' : (idEdicion ? 'Actualizar Producto' : 'Registrar Producto')}</button>
          {idEdicion && <button type="button" onClick={cancelarEdicion} className="bg-cafe-arena font-bold py-3 px-8 rounded-sm">Cancelar</button>}
        </div>
      </form>
    </div>

    <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 overflow-x-auto">
      <table className="w-full text-left min-w-[640px]">
        <thead className="bg-cafe-arena/60 text-xs uppercase text-cafe-tostado/80 font-bold">
          <tr><th className="p-4">Variedad</th><th className="p-4">Tipo / Pres. / Peso</th><th className="p-4">Precio</th><th className="p-4 text-center">Acciones</th></tr>
        </thead>
        <tbody className="divide-y divide-cafe-espresso/10">
          {productos.map(prod => (
            <tr key={prod.id} className="hover:bg-cafe-crema">
              <td className="p-4 font-bold"><div className="flex items-center gap-3">
                {prod.imagenUrl ? <img src={prod.imagenUrl} alt={prod.nombre} className="w-10 h-10 object-cover rounded-full shadow-sm" /> : <div className="w-10 h-10 bg-cafe-arena rounded-full flex items-center justify-center text-xs text-cafe-tostado/80 shadow-sm">N/A</div>}
                {prod.nombre}
              </div></td>
              <td className="p-4 text-sm text-cafe-tostado">{prod.tipo} - {prod.presentacion} - {prod.peso}</td>
              <td className="p-4 font-bold text-cafe-tostado">S/ {prod.precioReferencial}</td>
              <td className="p-4"><div className="flex justify-center gap-2">
                <button onClick={() => editarProducto(prod)} className="px-4 py-1 text-xs font-bold rounded-full bg-cafe-arena text-cafe-tostado">Editar</button>
                <button onClick={() => toggleActivo(prod.id, prod.activo)} className={`px-4 py-1 text-xs font-bold rounded-full ${prod.activo ? 'bg-cafe-hoja/15 text-cafe-hoja' : 'bg-red-100 text-red-700'}`}>{prod.activo ? 'Activo' : 'Inactivo'}</button>
                <button onClick={() => setProductoAEliminar(prod)} className="px-4 py-1 text-xs font-bold rounded-full border border-red-200 text-red-600 hover:bg-red-50">Eliminar</button>
              </div></td>
            </tr>
          ))}
            {productos.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-cafe-tostado/70 italic">No hay productos registrados.</td></tr>}
        </tbody>
      </table>
    </div>

    {productoAEliminar && (
      <ModalEliminarProducto
        key={productoAEliminar.id}
        producto={productoAEliminar}
        eliminando={eliminando}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setProductoAEliminar(null)}
      />
    )}
  </div>
);

export default AdminCatalogo;
