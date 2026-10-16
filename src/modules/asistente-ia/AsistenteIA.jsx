import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { registrarSolicitud } from '../solicitud-pedido/solicitudService';
import { construirPromptSistema } from './promptAsistente';
import { extraerSolicitud, construirSolicitudIA } from './solicitudIA';
import GranoCafe from '../../shared/components/portal/GranoCafe';

// 1. REEMPLAZA ESTO CON TU CLAVE REAL QUE EMPIEZA CON "AIzaSy..."
const GEMINI_API_KEY = "";

// 2. Inicializamos el SDK de Google
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Solo se monta para clientes con sesión iniciada; usa su perfil y el catálogo activo (REQ-F12)
const AsistenteIA = ({ userData, catalogo, trazabilidad }) => {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      remitente: 'ia',
      texto: `¡Hola, ${userData.nombre?.split(' ')[0] || 'cliente'}! Soy el asistente virtual de El Gosque. Puedo contarte sobre nuestras variedades de café, su trazabilidad y la cafetería, o ayudarte a registrar una solicitud de cotización.`
    }
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const { region, procesos, cargando: cargandoTrazabilidad } = trazabilidad;

  // Guardamos la instancia del chat en una referencia para mantener el contexto
  const chatContextRef = useRef(null);
  const chatFinRef = useRef(null);

  useEffect(() => {
    chatFinRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Inicializar el chat cuando ya se tienen los datos reales que usará el asistente.
  // Las dependencias son estados estables: el chat no se reinicia al enviar mensajes.
  useEffect(() => {
    if (cargandoTrazabilidad) return;
    const model = genAI.getGenerativeModel({
      model: "gemini-3.8-flash",
      systemInstruction: construirPromptSistema({ userData, catalogo, trazabilidad: { region, procesos } }),
      generationConfig: { temperature: 0.2 },
    });
    chatContextRef.current = model.startChat();
  }, [userData, catalogo, region, procesos, cargandoTrazabilidad]);

  const agregarMensajeIA = (texto) => setMensajes(prev => [...prev, { remitente: 'ia', texto }]);

  // REQ-F12-03: registrar la solicitud que el cliente confirmó, con precios del catálogo
  const registrarSolicitudConfirmada = async (jsonSolicitud) => {
    try {
      const solicitud = construirSolicitudIA(jsonSolicitud, { userData, catalogo });
      await registrarSolicitud(solicitud);
      return `\n\n✅ Solicitud registrada con código ${solicitud.codigo}. Total referencial: S/ ${solicitud.total.toFixed(2)} (el precio final lo confirma el administrador). Puedes revisarla en "Mis Pedidos".`;
    } catch (error) {
      console.error("Error al registrar la solicitud de la IA:", error);
      return `\n\n⚠️ No se pudo registrar la solicitud: ${error.message || 'error inesperado'} Revisemos los datos e inténtalo de nuevo.`;
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!inputTexto.trim() || cargando) return;

    const mensajeUsuario = inputTexto.trim();
    setMensajes(prev => [...prev, { remitente: 'usuario', texto: mensajeUsuario }]);
    setInputTexto('');

    if (!chatContextRef.current) {
      agregarMensajeIA('Estoy cargando la información de El Gosque, inténtalo en unos segundos.');
      return;
    }

    setCargando(true);
    try {
      const result = await chatContextRef.current.sendMessage(mensajeUsuario);
      const { texto, jsonSolicitud } = extraerSolicitud(result.response.text());
      const confirmacion = jsonSolicitud ? await registrarSolicitudConfirmada(jsonSolicitud) : '';
      agregarMensajeIA(texto + confirmacion);
    } catch (error) {
      console.error("Error de Gemini:", error);
      agregarMensajeIA('Ocurrió un error al contactar al servicio de IA. Intenta de nuevo.');
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
              placeholder="Pregunta por variedades o cotiza..."
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
