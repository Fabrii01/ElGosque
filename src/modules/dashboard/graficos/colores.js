// Paleta de gráficos con la identidad del portal, validada con el validador de dataviz sobre fondo #fbf8f2:
// verde #2f6b2f + mostaza #d9a441 → ΔE daltonismo 23.2. El mostaza tiene contraste < 3:1, por eso
// los gráficos que lo usan llevan leyenda, tooltip y vista de tabla.
export const COLOR_PRINCIPAL = '#2f6b2f';   // verde hoja: serie principal / ventas
export const COLOR_SECUNDARIO = '#d9a441';  // mostaza: segunda serie (solicitado)
export const COLOR_ATENUADO = '#c9a27e';    // kraft: categorías de contexto (cancelado)
export const COLOR_GRILLA = '#ead9bf';
export const COLOR_EJE = '#c9a27e';
export const COLOR_TEXTO_EJE = '#5b3a29';
export const COLOR_TEXTO = '#2a1d17';
export const COLOR_CURSOR = '#f5efe4';

// Estado (reservados: siempre acompañados de ícono y texto)
export const COLOR_ESTADO_BIEN = '#0ca30c';
export const COLOR_ESTADO_ALERTA = '#ec835a';

export const TICK_EJE = { fontSize: 12, fill: COLOR_TEXTO_EJE };
