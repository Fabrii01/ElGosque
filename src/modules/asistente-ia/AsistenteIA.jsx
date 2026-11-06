import { useState, useRef, useEffect } from 'react';
import { consultarGroq, recortarHistorial } from './groqService';
import { registrarSolicitud } from '../solicitud-pedido/solicitudService';
import { construirMensajeWhatsApp, abrirWhatsApp } from '../solicitud-pedido/whatsapp';
import { construirPromptSistema } from './promptAsistente';
import { extraerSolicitud, construirSolicitudIA, limpiarFormato, confirmacionPedida, PREGUNTA_CONFIRMACION } from './solicitudIA';
import GranoCafe from '../../shared/components/portal/GranoCafe';

// Solo se monta para clientes con sesión iniciada; usa su perfil y el catálogo activo (REQ-F12)
const AsistenteIA = ({ userData, catalogo, trazabilidad }) => {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      remitente: 'ia',
      texto: `¡Hola, ${userData.nombre?.split(' ')[0] || 'cliente'}! Soy el asistente virtual de El Gosque. Puedo contarte sobre nuestras variedades de café, su trazabilidad y la cafetería, o ayudarte a registrar una solicitud de pedido. Por favor, no escribas datos personales en este chat.`
    }
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const { region, procesos, cargando: cargandoTrazabilidad } = trazabilidad;

  // Instrucciones de sistema y mensajes de la conversación (el contexto que se reenvía a la IA)
  const historialRef = useRef(null);
  const chatFinRef = useRef(null);

  useEffect(() => {
    chatFinRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Inicializar el chat cuando ya se tienen los datos reales que usará el asistente.
  // Las dependencias son estados estables: el chat no se reinicia al enviar mensajes.
  useEffect(() => {
    if (cargandoTrazabilidad) return;
    historialRef.current = {
      sistema: construirPromptSistema({ userData, catalogo, trazabilidad: { region, procesos } }),
      mensajes: [],
    };
  }, [userData, catalogo, region, procesos, cargandoTrazabilidad]);

  // pedido: solicitud registrada en ese mensaje (muestra el botón de WhatsApp)
  const agregarMensajeIA = (texto, pedido = null) => setMensajes(prev => [...prev, { remitente: 'ia', texto, pedido }]);

  // REQ-F12-03: registrar la solicitud que el cliente confirmó, con precios del catálogo.
  // Igual que el pedido manual, luego se continúa por WhatsApp con el resumen (REQ-F06).
  const registrarSolicitudConfirmada = async (jsonSolicitud) => {
    try {
      const solicitud = construirSolicitudIA(jsonSolicitud, { userData, catalogo });
      await registrarSolicitud(solicitud);
      return {
        texto: `\n\n✅ Pedido registrado con código ${solicitud.codigo}. Total: S/ ${solicitud.total.toFixed(2)}. Para coordinar el pago y el envío, envía el resumen a nuestro WhatsApp. También puedes revisarlo en "Mis Pedidos".`,
        pedido: solicitud,
      };
    } catch (error) {
      console.error("Error al registrar la solicitud de la IA:", error);
      return { texto: `\n\n⚠️ No se pudo registrar la solicitud: ${error.message || 'error inesperado'} Revisemos los datos e inténtalo de nuevo.`, pedido: null };
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!inputTexto.trim() || cargando) return;

    const mensajeUsuario = inputTexto.trim();
    setMensajes(prev => [...prev, { remitente: 'usuario', texto: mensajeUsuario }]);
    setInputTexto('');

    if (!historialRef.current) {
      agregarMensajeIA('Estoy cargando la información de El Gosque, inténtalo en unos segundos.');
      return;
    }

    setCargando(true);
    try {
      const historial = historialRef.current;
      const conversacion = [...recortarHistorial(historial.mensajes), { role: 'user', content: mensajeUsuario }];
      const respuesta = await consultarGroq([{ role: 'system', content: historial.sistema }, ...conversacion]);
      let { texto, jsonSolicitud } = extraerSolicitud(respuesta);
      // Si la IA intenta registrar sin haber mostrado el resumen y pedido confirmación, primero se pregunta
      if (jsonSolicitud && !confirmacionPedida(conversacion)) {
        jsonSolicitud = null;
        if (!texto.includes(PREGUNTA_CONFIRMACION)) texto = `${texto}\n\n${PREGUNTA_CONFIRMACION}`;
      }
      historial.mensajes = [...conversacion, { role: 'assistant', content: jsonSolicitud ? respuesta : texto }];
      const registro = jsonSolicitud ? await registrarSolicitudConfirmada(jsonSolicitud) : { texto: '', pedido: null };
      agregarMensajeIA((limpiarFormato(texto) + registro.texto).trim(), registro.pedido);
    } catch (error) {
      console.error("Error del asistente de IA:", error);
      agregarMensajeIA(error.code === 'correo-sin-verificar'
        ? 'Para usar el asistente primero verifica tu correo: abre el enlace que te enviamos o pide otro desde el aviso de la página.'
        : 'Ocurrió un error al contactar al servicio de IA. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="bg-cafe-hoja hover:bg-cafe-selva text-white p-4 rounded-full shadow-xl flex items-center gap-2 transition-transform hover:scale-105"
        >
          <GranoCafe className="w-5 h-6 text-cafe-mostaza" />
          <span className="text-xs font-bold uppercase tracking-wider pr-1">Asistente El Gosque</span>
        </button>
      )}

      {abierto && (
        <div className="bg-cafe-leche rounded-md shadow-xl border border-cafe-espresso/15 w-80 sm:w-96 flex flex-col h-[500px] overflow-hidden animate-fade-in">
          <div className="bg-cafe-hoja p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <GranoCafe className="w-5 h-6 text-cafe-mostaza" />
              <div>
                <h4 className="font-bold text-sm">Asistente Virtual</h4>
                <p className="text-[10px] text-cafe-crema/75">El Gosque • IA de Orientación</p>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} className="text-cafe-crema/85 hover:text-white font-bold text-sm">✕</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-cafe-crema text-xs">
            {mensajes.map((m, idx) => (
              <div key={idx} className={`flex ${m.remitente === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-md max-w-[80%] whitespace-pre-line leading-relaxed ${m.remitente === 'usuario' ? 'bg-cafe-hoja text-white rounded-br-none' : 'bg-cafe-leche text-cafe-espresso border border-cafe-espresso/15 shadow-sm rounded-bl-none'}`}>
                  {m.texto}
                  {m.pedido && (
                    <button type="button" onClick={() => abrirWhatsApp(construirMensajeWhatsApp(m.pedido))} className="mt-3 w-full bg-[#25D366] hover:bg-green-600 text-white font-bold py-2.5 rounded-sm shadow whitespace-normal">
                      Continuar por WhatsApp
                    </button>
                  )}
                </div>
              </div>
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-cafe-leche text-cafe-tostado/70 p-3 rounded-md border border-cafe-espresso/15 text-xs flex items-center gap-1">
                  <span>Escribiendo</span><span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={chatFinRef} />
          </div>

          <form onSubmit={enviarMensaje} className="p-3 bg-cafe-leche border-t border-cafe-espresso/10 flex gap-2">
            <input
              type="text"
              placeholder="Pregunta por variedades o haz tu pedido..."
              className="flex-1 bg-cafe-crema border border-cafe-espresso/15 p-2.5 rounded-sm text-xs outline-none focus:ring-2 focus:ring-cafe-hoja"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
            />
            <button type="submit" disabled={cargando} className="bg-cafe-hoja hover:bg-cafe-selva disabled:bg-cafe-kraft text-white px-4 rounded-sm text-xs font-bold transition">
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AsistenteIA;
