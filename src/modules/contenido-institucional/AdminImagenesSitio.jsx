import { ESPACIOS_IMAGEN, DOCUMENTOS_IMAGEN } from '../../shared/imagenesSitio';

const TarjetaEspacio = ({ espacio, imagen, subiendo, subirImagenSitio, quitarImagen }) => (
  <div className="border border-cafe-espresso/15 rounded-md overflow-hidden flex flex-col">
    <div className="aspect-[4/3] bg-cafe-arena/60 flex items-center justify-center">
      {imagen
        ? <img src={imagen} alt={espacio.titulo} className="w-full h-full object-cover" />
        : <span className="text-xs text-cafe-tostado/70 px-4 text-center">Sin foto: se muestra una ilustración</span>}
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <p className="font-bold text-cafe-espresso">{espacio.titulo}</p>
      <p className="text-xs text-cafe-tostado/80 mt-1 flex-1">{espacio.descripcion}</p>
      <div className="flex flex-wrap gap-2 mt-4">
        <label className={`inline-flex items-center text-sm font-bold px-4 py-2 rounded-full cursor-pointer ${subiendo ? 'bg-cafe-arena text-cafe-tostado/80' : 'bg-cafe-hoja/10 text-cafe-hoja hover:bg-cafe-hoja/20'}`}>
          {subiendo ? 'Subiendo...' : imagen ? 'Cambiar foto' : 'Subir foto'}
          <input type="file" accept="image/*" className="hidden" disabled={subiendo} onChange={(e) => { subirImagenSitio(espacio.id, e.target.files[0]); e.target.value = ''; }} />
        </label>
        {imagen && <button onClick={() => quitarImagen(espacio.id)} className="text-sm font-bold px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50">Quitar</button>}
      </div>
    </div>
  </div>
);

// Panel admin: tarjetas de los espacios de imagen del portal, agrupadas
const AdminImagenesSitio = ({ imagenesSitio, espacioSubiendo, subirImagenSitio, quitarImagen }) => (
  <div className="bg-cafe-leche rounded-md shadow-sm border border-cafe-espresso/10 p-5 md:p-8 max-w-5xl mx-auto">
    <h3 className="font-bold text-2xl text-cafe-espresso mb-1">Imágenes del sitio</h3>
    <p className="text-sm text-cafe-tostado/80 mb-6">
      Fotos propias para el inicio y la trazabilidad. Se comprimen automáticamente. Si un espacio no tiene foto,
      la web muestra una ilustración. Usa solo fotos autorizadas por El Gosque.
    </p>

    {Object.entries(DOCUMENTOS_IMAGEN).map(([documento, titulo]) => (
      <section key={documento} className="mb-8 last:mb-0">
        <h4 className="text-sm font-bold text-cafe-tostado uppercase tracking-wide mb-3">{titulo}</h4>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ESPACIOS_IMAGEN.filter(e => e.documento === documento).map(espacio => (
            <TarjetaEspacio
              key={espacio.id}
              espacio={espacio}
              imagen={imagenesSitio[espacio.id]}
              subiendo={espacioSubiendo === espacio.id}
              subirImagenSitio={subirImagenSitio}
              quitarImagen={quitarImagen}
            />
          ))}
        </div>
      </section>
    ))}
  </div>
);

export default AdminImagenesSitio;
