import Revelar from '../../shared/components/Revelar';

// Título de cada sección de la página de la cafetería
const EncabezadoSeccion = ({ etiqueta, titulo, descripcion, oscuro = false }) => (
  <Revelar className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
    <span className={`text-xs font-bold tracking-[0.25em] uppercase ${oscuro ? 'text-cafe-mostaza' : 'text-cafe-cereza'}`}>{etiqueta}</span>
    <h2 className={`text-3xl md:text-5xl font-titulo font-semibold tracking-tight mt-3 ${oscuro ? 'text-white' : 'text-cafe-espresso'}`}>{titulo}</h2>
    <span className={`block w-12 h-0.5 mx-auto mt-5 ${oscuro ? 'bg-cafe-mostaza' : 'bg-cafe-hoja'}`} />
    {descripcion && <p className={`mt-5 text-base md:text-lg ${oscuro ? 'text-cafe-crema/80' : 'text-cafe-tostado/80'}`}>{descripcion}</p>}
  </Revelar>
);

export default EncabezadoSeccion;
