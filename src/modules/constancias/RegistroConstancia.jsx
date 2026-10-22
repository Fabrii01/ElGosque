import { useState } from 'react';
import ZonaArrastrar from '../../shared/components/ZonaArrastrar';
import { comprimirImagenHasta } from '../../shared/utils/imagenes';
import { requiereComprobante } from '../pagos/pago';

// La captura va dentro del documento del pedido (límite de 1 MB): se comprime hasta ~400 000 caracteres
const MAX_CARACTERES_CAPTURA = 400000;

// Constancia de pago (REQ-F09-03/05): captura del comprobante (Yape, Plin, transferencia) arrastrada al panel.
// Se guarda en pedido.datosPago.constanciaImagen. datosAnteriores = nro. de operación/referencia de pedidos antiguos.
const RegistroConstancia = ({ metodo, imagen, setImagen, datosAnteriores = [] }) => {
  const [procesando, setProcesando] = useState(false);
  const [ampliada, setAmpliada] = useState(false);
  const obligatoria = requiereComprobante(metodo);

  const recibirImagen = async (archivo) => {
    setProcesando(true);
    try {
      setImagen(await comprimirImagenHasta(archivo, MAX_CARACTERES_CAPTURA));
    } catch (error) {
      alert(error.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="md:col-span-3">
      <span className="block text-xs font-bold text-cafe-tostado uppercase mb-1">
        Captura del comprobante <span className="normal-case font-normal">{obligatoria ? '(obligatoria para marcar como Pagado)' : '(opcional)'}</span>
      </span>
      {imagen ? (
        <div className="border border-cafe-espresso/15 rounded-md bg-cafe-leche p-2 max-w-md">
          <button type="button" onClick={() => setAmpliada(!ampliada)} className="block w-full" aria-label={ampliada ? 'Reducir captura' : 'Ampliar captura'}>
            <img src={imagen} alt="Captura del comprobante de pago" className={`mx-auto rounded-sm object-contain ${ampliada ? 'max-h-[70vh]' : 'max-h-48'}`} />
          </button>
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="text-cafe-tostado/80">Clic en la imagen para {ampliada ? 'reducirla' : 'ampliarla'}</span>
            <button type="button" onClick={() => { setImagen(''); setAmpliada(false); }} className="font-bold text-red-600 hover:underline">Quitar</button>
          </div>
        </div>
      ) : (
        <ZonaArrastrar
          accept="image/*"
          onArchivo={recibirImagen}
          deshabilitado={procesando}
          titulo={procesando ? 'Procesando imagen...' : 'Arrastra aquí la captura del pago'}
          ayuda="Captura de Yape o Plin, o voucher de la transferencia."
        />
      )}
      {datosAnteriores.length > 0 && (
        <p className="text-xs text-cafe-tostado/80 mt-2">Registrado anteriormente: {datosAnteriores.join(' · ')}</p>
      )}
    </div>
  );
};

export default RegistroConstancia;
