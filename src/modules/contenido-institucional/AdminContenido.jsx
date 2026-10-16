const AdminContenido = ({ contenidoInfo, setContenidoInfo, guardarContenidoWeb }) => (
  <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-8 max-w-3xl mx-auto">
    <h3 className="font-bold text-2xl text-cafe-espresso mb-6">Información Institucional</h3>
    <form onSubmit={guardarContenidoWeb} className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-cafe-tostado uppercase mb-2">Título Principal</label>
        <input type="text" className="w-full bg-cafe-crema border p-4 rounded-sm outline-none" value={contenidoInfo.titulo} onChange={(e) => setContenidoInfo({...contenidoInfo, titulo: e.target.value})} required />
      </div>
      <div>
        <label className="block text-xs font-bold text-cafe-tostado uppercase mb-2">Descripción</label>
        <textarea rows="4" className="w-full bg-cafe-crema border p-4 rounded-sm outline-none" value={contenidoInfo.descripcion} onChange={(e) => setContenidoInfo({...contenidoInfo, descripcion: e.target.value})} required></textarea>
      </div>
      <button type="submit" className="bg-cafe-hoja text-white font-bold py-3 px-8 rounded-sm shadow-lg">Publicar Cambios</button>
    </form>
  </div>
);

export default AdminContenido;
