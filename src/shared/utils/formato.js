const formatoSoles = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatoSolesCorto = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', notation: 'compact', maximumFractionDigits: 1 });
const formatoEntero = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 0 });

// "S/ 1,234.50"
export const formatearSoles = (valor) => formatoSoles.format(Number(valor) || 0);

// "S/ 1.2 mil" para ejes de gráficos
export const formatearSolesCorto = (valor) => formatoSolesCorto.format(Number(valor) || 0);

export const formatearEntero = (valor) => formatoEntero.format(Number(valor) || 0);

export const formatearPorcentaje = (valor) => `${Math.round((Number(valor) || 0) * 100)} %`;
