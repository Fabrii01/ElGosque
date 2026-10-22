import { useState } from 'react';

// Zona para arrastrar y soltar un archivo (o elegirlo con un clic). Entrega el archivo en onArchivo.
const ZonaArrastrar = ({ accept, onArchivo, deshabilitado = false, titulo, ayuda, children }) => {
  const [encima, setEncima] = useState(false);

  const recibir = (archivos) => {
    const archivo = archivos?.[0];
    if (archivo && !deshabilitado) onArchivo(archivo);
  };

  return (
    <label
      onDragOver={e => { e.preventDefault(); if (!deshabilitado) setEncima(true); }}
      onDragLeave={() => setEncima(false)}
      onDrop={e => { e.preventDefault(); setEncima(false); recibir(e.dataTransfer.files); }}
      className={`block border-2 border-dashed rounded-md p-5 text-center transition-colors ${
        deshabilitado ? 'border-cafe-kraft/60 bg-cafe-crema/60 cursor-wait'
          : encima ? 'border-cafe-hoja bg-cafe-hoja/10 cursor-copy'
            : 'border-cafe-espresso/25 bg-cafe-crema hover:border-cafe-hoja cursor-pointer'
      }`}
    >
      <input
        type="file"
        accept={accept}
        disabled={deshabilitado}
        className="sr-only"
        onChange={e => { recibir(e.target.files); e.target.value = ''; }}
      />
      <span className="block font-bold text-cafe-espresso">{titulo}</span>
      {ayuda && <span className="block text-xs text-cafe-tostado/80 mt-1">{ayuda}</span>}
      {children}
    </label>
  );
};

export default ZonaArrastrar;
