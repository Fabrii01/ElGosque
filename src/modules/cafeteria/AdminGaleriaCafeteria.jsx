import { MAX_FOTOS_LOCAL } from './carta';

// Fotos del local para la galería y la portada (REQ-F13-03, RN-11)
const AdminGaleriaCafeteria = ({ fotos, subiendoFoto, agregarFoto, eliminarFoto }) => (
  <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-5 md:p-8">
    <h3 className="font-bold text-2xl text-cafe-espresso mb-1">Galería del Local</h3>
    <p className="text-sm text-cafe-tostado/80 mb-6">
      Solo fotografías autorizadas por El Gosque. Máximo {MAX_FOTOS_LOCAL}; se comprimen automáticamente.
      La <strong>primera</strong> se usa como portada de la página de la cafetería y como fondo en el inicio.
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
      {fotos.map((foto, i) => (
        <div key={i} className="relative group">
          <img src={foto} alt={`Foto del local ${i + 1}`} className="w-full aspect-[4/3] object-cover rounded-sm" />
          {i === 0 && <span className="absolute top-2 left-2 bg-cafe-hoja text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full">Portada</span>}
          <button onClick={() => eliminarFoto(i)} className="absolute top-2 right-2 bg-cafe-crema/95 text-red-600 text-xs font-bold px-3 py-1 rounded-full shadow">Quitar</button>
        </div>
      ))}
      {fotos.length === 0 && <p className="col-span-full text-sm text-cafe-tostado/70 italic">Aún no hay fotos del local.</p>}
    </div>
    {fotos.length < MAX_FOTOS_LOCAL && (
      <label className="inline-flex items-center gap-2 bg-cafe-hoja/10 text-cafe-hoja font-bold text-sm px-4 py-2 rounded-full cursor-pointer hover:bg-cafe-hoja/20">
        {subiendoFoto ? 'Subiendo...' : '+ Agregar foto'}
        <input type="file" accept="image/*" className="hidden" disabled={subiendoFoto} onChange={(e) => { agregarFoto(e.target.files[0]); e.target.value = ''; }} />
      </label>
    )}
  </div>
);

export default AdminGaleriaCafeteria;
