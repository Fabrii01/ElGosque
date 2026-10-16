// Las imágenes se guardan en base64 dentro de documentos de Firestore (límite de 1 MB por documento),
// así que se redimensionan y comprimen en el navegador antes de guardarlas.

const cargarImagen = (archivo) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(archivo);
  const img = new Image();
  img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('El archivo no es una imagen válida.')); };
  img.src = url;
});

// Devuelve un data URL JPEG cuyo lado mayor no supera maxLado px
export const comprimirImagen = async (archivo, { maxLado = 1000, calidad = 0.75 } = {}) => {
  if (!archivo.type.startsWith('image/')) throw new Error('El archivo no es una imagen.');
  const img = await cargarImagen(archivo);
  const escala = Math.min(1, maxLado / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * escala);
  canvas.height = Math.round(img.height * escala);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; // fondo blanco para PNG con transparencia
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', calidad);
};

// Comprime con calidades decrecientes hasta que el data URL quepa en maxCaracteres
// (Firestore admite 1 MB por documento y el base64 ocupa ~33 % más que la imagen)
export const comprimirImagenHasta = async (archivo, maxCaracteres) => {
  for (const [maxLado, calidad] of [[1600, 0.78], [1400, 0.7], [1200, 0.62], [1000, 0.55], [800, 0.5]]) {
    const imagen = await comprimirImagen(archivo, { maxLado, calidad });
    if (imagen.length <= maxCaracteres) return imagen;
  }
  throw new Error('La imagen es muy pesada incluso comprimida. Prueba con otra.');
};
