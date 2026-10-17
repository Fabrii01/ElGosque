// Reglas de la carta de la cafetería (REQ-F13)

export const HORARIO_CAFETERIA = 'Lun - Sáb | 9:00 AM - 9:00 PM';
export const MAX_FOTOS_LOCAL = 6;

// Agrupa las preparaciones por categoría, ordenadas alfabéticamente
export const agruparPorCategoria = (preparaciones) => {
  const grupos = {};
  preparaciones.forEach(p => {
    const categoria = p.categoria?.trim() || 'Otros';
    (grupos[categoria] ||= []).push(p);
  });
  return Object.entries(grupos)
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([categoria, items]) => ({ categoria, items: items.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) }));
};

export const categoriasExistentes = (preparaciones) => [...new Set(preparaciones.map(p => p.categoria?.trim()).filter(Boolean))].sort();

// Categorías fijas de la carta (el admin las elige de una lista, no las escribe)
export const CATEGORIAS_CAFETERIA = ['Postres', 'Café', 'Sandwich', 'Jugos', 'Desayunos Especiales'];
