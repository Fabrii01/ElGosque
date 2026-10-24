import Revelar from '../../shared/components/Revelar';
import EtiquetaSeccion from '../../shared/components/portal/EtiquetaSeccion';
import { IlustracionSaco } from '../../shared/components/portal/Ilustraciones';
import { formatearSoles } from '../../shared/utils/formato';

const CHIP_TIPO = { Verde: 'bg-cafe-hoja', Tostado: 'bg-cafe-tostado' };

// Imagen del producto o, si no tiene, un saco ilustrado con etiqueta (verde o tostado según el tipo)
const ImagenProducto = ({ producto }) => (
  <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
    {producto.imagenUrl ? (
      <img src={producto.imagenUrl} alt={producto.nombre} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
    ) : (
      <>
        <IlustracionSaco verde={producto.tipo === 'Verde'} className="w-full h-full block" />
        <span className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 bg-cafe-crema text-cafe-espresso font-titulo text-sm px-3 py-1.5 max-w-[60%] text-center leading-tight shadow-sm">{producto.nombre}</span>
      </>
    )}
    <span className={`absolute top-3 left-3 ${CHIP_TIPO[producto.tipo] || 'bg-cafe-espresso'} text-cafe-crema text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-sm`}>{producto.tipo}</span>
  </div>
);

// Catálogo público de productos activos (REQ-F03)
const CatalogoProductos = ({ productos, cargando, onAgregar }) => (
  <section id="catalogo" className="scroll-mt-20 bg-cafe-arena font-cuerpo">
    <div className="container mx-auto px-4 md:px-8 py-20 md:py-28">
      <Revelar className="grid lg:grid-cols-12 gap-6 mb-10 items-end bg-cafe-tostado text-cafe-crema rounded-md shadow-lg border-b-8 border-cafe-hoja p-7 md:p-10">
        <div className="lg:col-span-7">
          <EtiquetaSeccion numero="02" texto="Nuestros cafés" color="mostaza" />
          <h2 className="font-titulo font-light text-4xl md:text-5xl mt-5">Catálogo</h2>
        </div>
        <p className="lg:col-span-5 text-cafe-crema/90 leading-relaxed">
          Café verde y tostado, en grano o molido.
        </p>
      </Revelar>

      {cargando ? (
        <p className="bg-cafe-leche rounded-md p-6 text-cafe-tostado">Cargando catálogo...</p>
      ) : productos.length === 0 ? (
        <p className="bg-cafe-leche rounded-md p-6 text-cafe-tostado border-l-4 border-cafe-cereza">Catálogo en actualización. El administrador está registrando los productos.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {productos.map((producto, i) => (
            <Revelar key={producto.id} retraso={(i % 4) * 100} className="h-full">
              <article className="group h-full flex flex-col bg-cafe-leche border border-cafe-espresso/10 border-b-4 border-b-cafe-hoja rounded-md p-3 shadow-sm hover:border-b-cafe-selva hover:shadow-lg hover:-translate-y-1 transition duration-300">
                <ImagenProducto producto={producto} />
                <div className="pt-5 px-1 pb-1 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4 pb-4 border-b border-cafe-espresso/15">
                    <h3 className="font-titulo text-xl text-cafe-espresso leading-tight">{producto.nombre}</h3>
                    <p className="text-right shrink-0">
                      <span className="block font-titulo text-lg text-cafe-cereza tabular-nums">{formatearSoles(producto.precioReferencial)}</span>
                    </p>
                  </div>
                  <dl className="grid grid-cols-2 gap-y-1.5 text-sm mt-4">
                    <dt className="text-cafe-tostado">Presentación</dt><dd className="text-right text-cafe-espresso">{producto.presentacion}</dd>
                    <dt className="text-cafe-tostado">Peso</dt><dd className="text-right text-cafe-espresso">{producto.peso}</dd>
                  </dl>
                  {producto.descripcion && <p className="mt-3 text-sm text-cafe-tostado leading-relaxed line-clamp-3">{producto.descripcion}</p>}
                  {/* Sin onAgregar (rol admin) no se muestra el botón de pedido */}
                  {onAgregar && (
                    <div className="mt-auto pt-6">
                      <button
                        onClick={() => onAgregar(producto)}
                        className="w-full bg-cafe-hoja text-cafe-crema py-2.5 rounded-sm hover:bg-cafe-selva transition-colors text-sm"
                      >
                        Solicitar pedido
                      </button>
                    </div>
                  )}
                </div>
              </article>
            </Revelar>
          ))}
        </div>
      )}
    </div>
  </section>
);

export default CatalogoProductos;
