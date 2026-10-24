// Fases del proceso del café: agrupan las 9 etapas y les dan un color (identidad del portal).
// Las clases se escriben completas para que Tailwind las incluya en el CSS final.

export const FASES = {
  campo: {
    nombre: 'En el campo',
    fondo: 'bg-cafe-hoja', texto: 'text-cafe-hoja', borde: 'border-cafe-hoja', suave: 'bg-cafe-hoja/10', anillo: 'ring-cafe-hoja/30',
  },
  beneficio: {
    nombre: 'Beneficio del grano',
    fondo: 'bg-cafe-cereza', texto: 'text-cafe-cereza', borde: 'border-cafe-cereza', suave: 'bg-cafe-cereza/10', anillo: 'ring-cafe-cereza/30',
  },
  planta: {
    nombre: 'Tostado y empaque',
    fondo: 'bg-cafe-tostado', texto: 'text-cafe-tostado', borde: 'border-cafe-tostado', suave: 'bg-cafe-tostado/10', anillo: 'ring-cafe-tostado/30',
  },
};

const FASE_POR_ETAPA = {
  semilla: 'campo', cultivo: 'campo', cosecha: 'campo',
  despulpado: 'beneficio', fermentacion: 'beneficio', lavado: 'beneficio', secado: 'beneficio',
  tostado: 'planta', empaquetado: 'planta',
};

// "Fermentación" -> "fermentacion"
export const claveEtapa = (nombre = '') => nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

// Etapas con nombres no reconocidos se asignan a una fase según su posición
export const faseDeEtapa = (nombre, indice = 0, total = 9) => {
  const clave = FASE_POR_ETAPA[claveEtapa(nombre)];
  if (clave) return clave;
  const proporcion = total > 0 ? indice / total : 0;
  return proporcion < 1 / 3 ? 'campo' : proporcion < 7 / 9 ? 'beneficio' : 'planta';
};

// Fase de un elemento del carrusel: la indicada explícitamente (p. ej. los momentos del inicio) o la deducida del nombre
export const claveFase = (elemento, indice, total) => elemento.fase || faseDeEtapa(elemento.nombre, indice, total);

// Texto de cada etapa a partir de los datos de El Gosque (región, 1800-2000 msnm, cosecha manual, fermentación
// controlada, secado al sol, tueste artesanal y sellado hermético; ver momentosOrigen.js). Pendiente de validar por El Gosque (RN-11).
// Se usa cuando la etapa no tiene descripción en Firestore y desde el botón "Usar textos de El Gosque" del panel.
const DESCRIPCIONES_ETAPAS = {
  semilla: 'Todo empieza en Rodríguez de Mendoza, Amazonas, con la selección de las semillas para los almácigos. De esta elección dependen la salud de la planta y el carácter de la taza.',
  cultivo: 'Los cafetos crecen con manejo orgánico en tierras fértiles de altura, entre 1800 y 2000 msnm. A esa altura el grano madura lentamente y desarrolla más dulzor y acidez.',
  cosecha: 'La cosecha es manual y selectiva: solo se recogen las cerezas maduras de color rojo. Recolectar cada fruto en su punto asegura un sabor uniforme.',
  despulpado: 'Poco después de la cosecha se retiran la cáscara y la pulpa de la cereza para liberar los granos, que aún conservan una capa dulce llamada mucílago.',
  fermentacion: 'Los granos reposan en una fermentación controlada de forma orgánica, que descompone el mucílago y resalta los perfiles de sabor de cada variedad.',
  lavado: 'Con agua limpia se retiran los restos de mucílago que deja la fermentación. Así se obtiene un grano limpio y listo para el secado.',
  secado: 'El grano se seca de forma natural al sol hasta alcanzar la humedad adecuada para conservarse. Luego se retira su cascarilla para obtener el café verde.',
  tostado: 'El café verde se tuesta de forma artesanal con curvas de tueste suave, medio y fuerte, según el perfil que se busca resaltar en cada variedad.',
  empaquetado: 'El café, en grano o molido, se empaca con sellado hermético para conservar su aroma y frescura hasta que llegue a tu taza.',
};

export const descripcionPorDefecto = (nombre) => DESCRIPCIONES_ETAPAS[claveEtapa(nombre)] || '';
