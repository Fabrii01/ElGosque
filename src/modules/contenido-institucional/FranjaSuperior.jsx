import GranoCafe from '../../shared/components/portal/GranoCafe';

// Franja verde sobre la navegación del portal
const FranjaSuperior = () => (
  <div className="bg-cafe-hoja text-cafe-crema font-cuerpo text-xs">
    <div className="container mx-auto px-4 md:px-8 py-2 flex items-center justify-center sm:justify-start gap-4">
      <p className="flex items-center gap-2 tracking-wide">
        <GranoCafe className="w-3 h-4 text-cafe-mostaza" /> Café orgánico de Amazonas, Perú
      </p>
    </div>
  </div>
);

export default FranjaSuperior;
