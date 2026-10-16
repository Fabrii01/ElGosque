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
