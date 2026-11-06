import { useEffect, useState } from 'react';
import { comprobarCorreoVerificado, enviarVerificacionCorreo } from './sesionService';

// Aviso para clientes sin correo verificado: pueden navegar, pero no registrar pedidos (firestore.rules)
const AvisoVerificarCorreo = ({ email }) => {
  const [verificado, setVerificado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [ocupado, setOcupado] = useState(false);

  // Al volver a la pestaña desde el correo, el aviso desaparece solo si ya verificó
  useEffect(() => {
    if (verificado) return undefined;
    const comprobar = () => comprobarCorreoVerificado().then(setVerificado).catch(() => {});
    comprobar();
    window.addEventListener('focus', comprobar);
    return () => window.removeEventListener('focus', comprobar);
  }, [verificado]);

  const reenviar = async () => {
    setOcupado(true);
    try {
      await enviarVerificacionCorreo();
      setMensaje(`Te enviamos un nuevo enlace a ${email}. Revisa también la carpeta de spam.`);
    } catch (error) {
      setMensaje(error.code === 'auth/too-many-requests'
        ? 'Ya enviamos varios correos. Espera unos minutos antes de pedir otro.'
        : 'No se pudo enviar el correo. Inténtalo de nuevo.');
    } finally {
      setOcupado(false);
    }
  };

  const yaVerifique = async () => {
    setOcupado(true);
    try {
      const confirmado = await comprobarCorreoVerificado();
      setVerificado(confirmado);
      if (!confirmado) setMensaje('Tu correo aún no aparece verificado. Abre el enlace que te enviamos.');
    } catch {
      setMensaje('No se pudo comprobar. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setOcupado(false);
    }
  };

  if (verificado) return null;

  return (
    <div role="status" className="bg-cafe-arena border-b border-cafe-kraft/60 text-cafe-espresso">
      <div className="container mx-auto px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center gap-3 text-sm">
        <p className="flex-1">
          <strong>Verifica tu correo para poder registrar pedidos.</strong> Abre el enlace que enviamos a {email}.
          {mensaje && <span className="block mt-1 text-cafe-tostado">{mensaje}</span>}
        </p>
        <div className="flex gap-2 shrink-0">
          <button type="button" disabled={ocupado} onClick={reenviar} className="border border-cafe-tostado text-cafe-tostado hover:bg-cafe-leche disabled:opacity-60 font-semibold px-3 py-2 rounded-sm transition">Reenviar correo</button>
          <button type="button" disabled={ocupado} onClick={yaVerifique} className="bg-cafe-hoja hover:bg-cafe-selva disabled:opacity-60 text-white font-semibold px-3 py-2 rounded-sm transition">Ya lo verifiqué</button>
        </div>
      </div>
    </div>
  );
};

export default AvisoVerificarCorreo;
