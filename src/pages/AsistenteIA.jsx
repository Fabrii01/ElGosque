import React, { useState, useRef, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. REEMPLAZA ESTO CON TU CLAVE REAL QUE EMPIEZA CON "AIzaSy..."
const GEMINI_API_KEY = ""; 

// 2. Inicializamos el SDK de Google
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const AsistenteIA = ({ userData }) => {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      remitente: 'ia',
      texto: '¡Hola! Soy el asistente virtual de El Gosque. ¿Te gustaría conocer sobre nuestras 9 variedades de café, el proceso de trazabilidad, o cotizar un pedido?'
    }
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  
  // Guardamos la instancia del chat en una referencia para mantener el contexto
  const chatContextRef = useRef(null);
  const chatFinRef = useRef(null);

  // Reglas estrictas del REQ-F12
  const PROMPT_SISTEMA = `
Eres el Asistente Virtual Oficial de la empresa "El Gosque" (café orgánico de Amazonas, vendido en Trujillo).
REGLAS ESTRICTAS:
1. Responde dudas sobre nuestras 9 variedades (Gourmet, Especial El Gosque, Oro Negro, Caracolillo, Orgone, Gran Selección, Geisha, Huayacho, Suflexión) y la trazabilidad (Semilla, Cultivo, Cosecha, Despulpado, Fermentación, Lavado, Secado, Tostado, Empaquetado).
2. Cuando el usuario quiera cotizar, pídele: Producto, Cantidad, Presentación (En grano o Molido), Ciudad y Tipo de Negocio.
3. Explica que los precios finales se negocian con el administrador por WhatsApp. Nunca des precios cerrados ni confirmes pedidos finales.
4. Cuando tengas Producto, Cantidad, Presentación y Ciudad, responde amablemente y finaliza tu mensaje EXACTAMENTE con este JSON:
<<<SOLICITUD:{"producto":"nombre","cantidad":1,"presentacion":"En grano","ciudad":"ciudad","negocio":"tipo"}>>>
`;

  useEffect(() => {
    chatFinRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  // Inicializar el chat con el modelo gratuito de Google
  useEffect(() => {
    const model = genAI.getGenerativeModel({ model: "gemini-3.8-flash" });
    chatContextRef.current = model.startChat({
      history: [
        { role: "user", parts: [{ text: PROMPT_SISTEMA }] },
        { role: "model", parts: [{ text: "Entendido, cumpliré las directivas como asistente virtual de El Gosque." }] },
      ],
    });
  }, []);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!inputTexto.trim() || cargando) return;

    const mensajeUsuario = inputTexto.trim();
    setMensajes(prev => [...prev, { remitente: 'usuario', texto: mensajeUsuario }]);
    setInputTexto('');
    setCargando(true);

    try {
      // Usamos el SDK oficial para enviar el mensaje
      const result = await chatContextRef.current.sendMessage(mensajeUsuario);
      let respuestaIA = result.response.text();

      // Detección automática del REQ-F12-03 (Generar Solicitud)
      if (respuestaIA.includes('<<<SOLICITUD:') && respuestaIA.includes('>>>')) {
        const rawJson = respuestaIA.split('<<<SOLICITUD:')[1].split('>>>')[0];
        try {
          const datosSolicitud = JSON.parse(rawJson);
          
          const codigoUnico = "IA-REQ-" + Math.floor(Math.random() * 9000 + 1000);
          await addDoc(collection(db, "pedidos"), {
            codigo: codigoUnico,
            clienteId: userData?.uid || 'anonimo',
            clienteNombre: userData?.nombre || 'Cliente Asistente IA',
            telefono: userData?.telefono || 'No especificado',
            ciudad: datosSolicitud.ciudad || 'No especificada',
            negocio: datosSolicitud.negocio || 'Consulta IA',
            productos: [{
              nombre: datosSolicitud.producto,
              cantidad: Number(datosSolicitud.cantidad) || 1,
              presentacion: datosSolicitud.presentacion || 'En grano',
              precioUnitario: 0,
              subtotal: 0
            }],
            total: 0,
            estado: 'Pendiente',
            origen: 'Asistente IA',
            fecha: serverTimestamp()
          });

          // Limpiamos la etiqueta del mensaje para que el usuario no vea el código JSON
          respuestaIA = respuestaIA.replace(/<<<SOLICITUD:[\s\S]*?>>>/, '').trim();
          respuestaIA += `\n\n✅ Se ha generado tu Solicitud Preliminar con código: **${codigoUnico}**. El administrador la revisará a la brevedad.`;
        } catch (err) {
          console.error("Error al procesar JSON de la IA:", err);
        }
      }

      setMensajes(prev => [...prev, { remitente: 'ia', texto: respuestaIA }]);
    } catch (error) {
      console.error("Error de Gemini:", error);
      setMensajes(prev => [...prev, { remitente: 'ia', texto: 'Ocurrió un error al contactar al servicio de IA. Intenta de nuevo.' }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className="bg-gosque-green hover:bg-green-800 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 transition-transform hover:scale-105"
        >
          <span className="text-xl">🤖</span>
          <span className="text-xs font-bold uppercase tracking-wider pr-1">Asistente El Gosque</span>
        </button>
      )}

      {abierto && (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-80 sm:w-96 flex flex-col h-[500px] overflow-hidden animate-fade-in">
          <div className="bg-gosque-green p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h4 className="font-bold text-sm">Asistente Virtual</h4>
                <p className="text-[10px] text-green-200">El Gosque • IA de Orientación</p>
              </div>
            </div>
            <button onClick={() => setAbierto(false)} className="text-green-100 hover:text-white font-bold text-sm">✕</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 text-xs">
            {mensajes.map((m, idx) => (
              <div key={idx} className={`flex ${m.remitente === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-line leading-relaxed ${m.remitente === 'usuario' ? 'bg-gosque-green text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none'}`}>
                  {m.texto}
                </div>
              </div>
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-400 p-3 rounded-2xl border border-gray-200 text-xs flex items-center gap-1">
                  <span>Escribiendo</span><span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={chatFinRef} />
          </div>

          <form onSubmit={enviarMensaje} className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              placeholder="Pregunta por variedades o cotiza..."
              className="flex-1 bg-gray-50 border border-gray-200 p-2.5 rounded-xl text-xs outline-none focus:ring-2 focus:ring-gosque-green"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
            />
            <button type="submit" disabled={cargando} className="bg-gosque-green hover:bg-green-800 disabled:bg-gray-300 text-white px-4 rounded-xl text-xs font-bold transition">
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AsistenteIA;