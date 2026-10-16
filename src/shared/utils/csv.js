// Exportación a CSV compatible con Excel (UTF-8 con BOM para tildes y ñ)

const escaparCelda = (valor) => {
  const texto = valor === null || valor === undefined ? '' : String(valor);
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
