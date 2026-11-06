// Exportación a CSV compatible con Excel (UTF-8 con BOM para tildes y ñ)

// Excel ejecuta como fórmula el texto que empieza con = + - @ (o tabulador/retorno): un cliente podría
// registrar "=HYPERLINK(...)" como negocio. Se antepone un apóstrofo solo a textos; los números no cambian.
const neutralizarFormula = (valor) => {
  const texto = valor === null || valor === undefined ? '' : String(valor);
  return typeof valor === 'string' && /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
};

const escaparCelda = (valor) => {
  const texto = neutralizarFormula(valor);
  return /[",\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

// columnas: [{ titulo, valor: (fila) => any }]
export const generarCSV = (filas, columnas) => {
  const encabezado = columnas.map(c => escaparCelda(c.titulo)).join(',');
  const cuerpo = filas.map(fila => columnas.map(c => escaparCelda(c.valor(fila))).join(','));
  return [encabezado, ...cuerpo].join('\r\n');
};

export const descargarCSV = (nombreArchivo, contenido) => {
  const blob = new Blob(['﻿' + contenido], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
};
