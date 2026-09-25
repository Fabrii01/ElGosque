import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Trazabilidad = () => {
  const [region, setRegion] = useState('');
  const [procesos, setProcesos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // REQ-F04: Extraer la configuración desde Firebase
  useEffect(() => {
    const cargarTrazabilidad = async () => {
      try {
        const docTraza = await getDoc(doc(db, "ajustes", "trazabilidad"));
        if (docTraza.exists()) {
          setRegion(docTraza.data().region || 'No especificada');
          setProcesos(docTraza.data().etapas || []);
        }
      } catch (error) {
        console.error("Error al cargar trazabilidad", error);
      }
      setCargando(false);
    };
    cargarTrazabilidad();
  }, []);

  const beneficios = [
    { titulo: "Escudo Neuroprotector", desc: "El consumo regular previene enfermedades neurodegenerativas.", icon: "🧠" },
    { titulo: "Salud Digestiva", desc: "Antioxidantes que reducen riesgos en el colon.", icon: "🛡️" },
    { titulo: "Poder del Café Verde", desc: "Potente depurador metabólico al consumirse como té.", icon: "🌿" },
    { titulo: "Energía Pura", desc: "Energizante 100% natural. Recomendado sin azúcar.", icon: "⚡" }
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 scroll-smooth">
      <nav className="bg-white/90 backdrop-blur-md text-gosque-brown p-4 sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter text-gosque-green">EL GOSQUE.</Link>
          <Link to="/" className="text-sm font-bold text-gray-500 hover:text-gosque-green transition-colors flex items-center gap-2">
            Volver al Inicio
          </Link>
        </div>
      </nav>

      <header className="relative bg-white pt-24 pb-32 px-4 text-center overflow-hidden">
        <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-amber-600 font-bold tracking-[0.2em] text-sm uppercase mb-6 bg-amber-100 px-4 py-1 rounded-full">Nuestra Historia</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-gray-900 tracking-tight leading-tight">
            Trazabilidad Total y <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-gosque-green to-green-500">Bienestar Natural.</span>
          </h1>
          {/* REQ-F04-03: Mostrar únicamente la región de procedencia */}
          <p className="text-xl font-bold text-gosque-green bg-green-50 px-6 py-2 rounded-full border border-green-200 shadow-sm">
            Región de Procedencia: {region}
          </p>
        </div>
      </header>

      <section className="py-24 container mx-auto px-4 md:px-8">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">El Ciclo del Café (9 Etapas)</h2>
          <p className="text-gray-500 text-lg">Garantizamos la transparencia desde el origen hasta el empaquetado.</p>
        </div>
        
        {cargando ? (
          <p className="text-center text-gray-500">Cargando etapas de trazabilidad...</p>
        ) : procesos.length === 0 ? (
          <p className="text-center text-gray-500">Aún no se ha registrado el proceso de trazabilidad.</p>
        ) : (
          <div className="space-y-16 max-w-5xl mx-auto">
            {procesos.map((paso, index) => (
              <div key={index} className={`flex flex-col md:flex-row items-center gap-8 lg:gap-12 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''} group`}>
                
                <div className="w-full md:w-1/2 overflow-hidden rounded-[2rem] h-[300px] shadow-lg border border-gray-100 bg-gray-100 flex items-center justify-center">
                  {/* REQ-F04-04: Informar cuando no haya contenido audiovisual */}
                  {paso.img ? (
                    <img src={paso.img} alt={paso.nombre} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="text-center p-6 text-gray-400">
                      <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      <p className="text-sm font-medium">Contenido audiovisual no disponible para esta etapa.</p>
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-1/2">
                  <span className="text-amber-500 font-black text-4xl opacity-30 block mb-2">0{index + 1}</span>
                  {/* REQ-F04-01: Nombre estricto de las 9 etapas */}
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">{paso.nombre}</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {paso.descripcion || "Información en proceso de actualización."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BENEFICIOS DE LA SALUD */}
      <section className="py-24 bg-gosque-green text-white px-4 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-amber-50">Salud en cada Taza</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="bg-white/10 p-8 rounded-[2rem] hover:bg-white/20 transition-colors">
                <div className="text-4xl mb-4">{beneficio.icon}</div>
                <h4 className="text-xl font-bold text-amber-400 mb-3">{beneficio.titulo}</h4>
                <p className="text-green-50/90 text-sm">{beneficio.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Trazabilidad;