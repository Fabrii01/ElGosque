import React from 'react';
import { Link } from 'react-router-dom';

const Trazabilidad = () => {
  // Datos del proceso productivo basados en los requerimientos del proyecto
  const procesos = [
    { 
      fase: "Semilla y Cultivo", 
      desc: "Cuidamos el origen en tierras fértiles de altura, específicamente en Rodríguez de Mendoza (Amazonas) a 1800 - 2000 m.s.n.m. Este clima frío nos otorga un rendimiento excepcional del 80%.",
      img: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80"
    },
    { 
      fase: "Cosecha y Despulpado", 
      desc: "Realizamos una selección manual exclusiva de cerezas maduras rojas, asegurando un proceso 100% natural y orgánico, respetando los ciclos de la tierra.",
      img: "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&w=800&q=80"
    },
    { 
      fase: "Fermentación y Lavado", 
      desc: "Aplicamos fermentación controlada para resaltar perfiles de sabor. Nuestra variedad 'Oro Negro' adquiere aquí su intensidad y ligero amargor característico.",
      img: "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?auto=format&fit=crop&w=800&q=80"
    },
    { 
      fase: "Secado, Tostado y Empaquetado", 
      desc: "Tras el secado natural al sol, aplicamos curvas de tueste artesanales (Suave, Medio y Fuerte) para nuestras 9 variedades, sellándolas herméticamente para preservar su frescura.",
      img: "https://images.unsplash.com/photo-1498604218683-176378eeb32a?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const beneficios = [
    {
      titulo: "Escudo Neuroprotector",
      desc: "El consumo regular previene enfermedades neurodegenerativas como el Alzheimer, brindando protección cerebral sostenida.",
      icon: "🧠"
    },
    {
      titulo: "Salud Digestiva",
      desc: "Sus antioxidantes ayudan a procesar grasas dañinas y reducen significativamente el riesgo de padecer cáncer de colon.",
      icon: "🛡️"
    },
    {
      titulo: "Poder del Café Verde",
      desc: "Consumido como infusión, el café sin tostar conserva su ácido clorogénico, actuando como un potente depurador metabólico.",
      icon: "🌿"
    },
    {
      titulo: "Energía Pura",
      desc: "Un energizante 100% natural. Recomendamos consumirlo sin azúcar para absorber todos sus beneficios metabólicos y cardiovasculares.",
      icon: "⚡"
    }
  ];

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-gray-800 scroll-smooth selection:bg-gosque-green selection:text-white">
      
      {/* NAVEGACIÓN LIMPIA */}
      <nav className="bg-white/90 backdrop-blur-md text-gosque-brown p-4 sticky top-0 z-50 border-b border-gray-100">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-black tracking-tighter text-gosque-green">EL GOSQUE.</Link>
          <Link to="/" className="text-sm font-bold tracking-wide text-gray-500 hover:text-gosque-green transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Volver al Inicio
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative bg-white pt-24 pb-32 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-amber-50/50 to-white"></div>
        <div className="relative z-20 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-amber-600 font-bold tracking-[0.2em] text-sm uppercase mb-6 bg-amber-100 px-4 py-1 rounded-full">Nuestra Historia</span>
          <h1 className="text-5xl md:text-7xl font-black mb-8 text-gray-900 tracking-tight leading-tight">
            Trazabilidad y <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-gosque-green to-green-500">Bienestar Natural.</span>
          </h1>
          <p className="text-xl font-light mb-12 text-gray-500 leading-relaxed">
            Nuestro nombre rinde homenaje a la <strong>Laguna de El Gosque</strong>. Al igual que ese santuario natural, nuestro café nace puro y orgánico en las alturas del Amazonas peruano.
          </p>
        </div>
      </header>

      {/* PROCESO DETALLADO (DISEÑO ALTERNADO) */}
      <section className="py-24 container mx-auto px-4 md:px-8">
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">El Ciclo del Café</h2>
          <p className="text-gray-500 text-lg">Garantizamos la transparencia total. Conoce cada paso del proceso que transforma la semilla en la taza perfecta que llega a tu negocio.</p>
        </div>
        
        <div className="space-y-24 max-w-6xl mx-auto">
          {procesos.map((paso, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-12 lg:gap-20 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''} group`}>
              {/* Imagen con bordes redondeados y sombra suave */}
              <div className="w-full md:w-1/2 overflow-hidden rounded-[2rem] shadow-2xl shadow-green-900/10">
                <img src={paso.img} alt={paso.fase} className="w-full h-[400px] object-cover transform group-hover:scale-105 transition-transform duration-700" />
              </div>
              {/* Contenido de texto limpio */}
              <div className="w-full md:w-1/2">
                <span className="text-amber-500 font-black text-6xl opacity-20 block mb-2">0{index + 1}</span>
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{paso.fase}</h3>
                <p className="text-lg text-gray-600 leading-relaxed">{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFICIOS DE LA SALUD (DISEÑO AGRO-TECH GRID) */}
      <section className="py-24 bg-gosque-green text-white px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-amber-50">Salud en cada Taza</h2>
            <p className="text-green-100/80 text-lg max-w-2xl mx-auto font-light">
              El consumo de nuestro café orgánico de altura no solo es una experiencia sensorial, es una decisión de bienestar respaldada por la ciencia.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-[2rem] hover:bg-white/20 transition-colors duration-300">
                <div className="text-4xl mb-6">{beneficio.icon}</div>
                <h4 className="text-2xl font-bold text-amber-400 mb-4">{beneficio.titulo}</h4>
                <p className="text-green-50/90 text-sm leading-relaxed">{beneficio.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <p className="text-sm tracking-wide font-medium">© 2026 El Gosque. Trazabilidad y Bienestar.</p>
      </footer>
    </div>
  );
};

export default Trazabilidad;