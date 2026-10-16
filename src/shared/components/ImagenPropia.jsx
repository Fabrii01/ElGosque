import { useState } from 'react';

// Imagen con respaldo: si no hay src o el archivo falla al cargar, se muestra el "respaldo"
// (por ejemplo una ilustración) en lugar de una imagen rota.
const ImagenPropia = ({ src, alt, className = '', respaldo = null, ...resto }) => {
  // Se recuerda qué src falló: si luego llega otro (p. ej. la imagen subida desde el panel), se vuelve a intentar
  const [srcFallido, setSrcFallido] = useState(null);
  if (!src || srcFallido === src) return respaldo;
  return <img src={src} alt={alt} className={className} onError={() => setSrcFallido(src)} {...resto} />;
};

export default ImagenPropia;
