import { describe, it, expect } from 'vitest';
import { generarCSV } from '../../src/shared/utils/csv';
import { COLUMNAS_PEDIDOS } from '../../src/modules/dashboard/reportes';

// CA15 - Exportación a CSV (csv.js y reportes.js) | REQ-F11 (reportes exportables)
const columnas = [
  { titulo: 'Cliente', valor: f => f.cliente },
  { titulo: 'Total', valor: f => f.total },
];
const columna = (titulo) => COLUMNAS_PEDIDOS.find(c => c.titulo === titulo);

describe('CA15 - Exportación a CSV (csv.js y reportes.js)', () => {
  it('1.0 [+] CSV con encabezado y filas', () => {
    const csv = generarCSV([{ cliente: 'Ana Torres', total: 90 }, { cliente: 'Beto Ruiz', total: 45 }], columnas);
    expect(csv.split('\r\n')).toEqual(['Cliente,Total', 'Ana Torres,90', 'Beto Ruiz,45']);
  });

  it('2.0 [+] Celdas con comas, comillas y saltos de línea', () => {
    const csv = generarCSV([{ cliente: 'Café, Aroma', total: 'Dijo "hola"' }, { cliente: 'línea1\nlínea2', total: 1 }], columnas);
    expect(csv).toBe('Cliente,Total\r\n"Café, Aroma","Dijo ""hola"""\r\n"línea1\nlínea2",1');
  });

  it('3.0 [–] Valores nulos', () => {
    const csv = generarCSV([{ cliente: null, total: undefined }], columnas);
    expect(csv.split('\r\n')[1]).toBe(',');
    expect(csv).not.toMatch(/null|undefined/);
  });

  it('4.0 [+] Columnas del reporte de pedidos', () => {
    expect(COLUMNAS_PEDIDOS).toHaveLength(21);
    expect(COLUMNAS_PEDIDOS[0].titulo).toBe('Código');
  });

  it('5.0 [+] Total con 2 decimales', () => {
    expect(columna('Total (S/)').valor({ total: 136.5 })).toBe('136.50');
  });

  it('6.0 [–] Pedido sin pago ni envío', () => {
    const pedido = { codigo: 'REQ-20261019-ABC234', estado: 'Pendiente', total: 90, productos: [] };
    expect(() => generarCSV([pedido], COLUMNAS_PEDIDOS)).not.toThrow();
    expect(columna('Medio de pago').valor(pedido) ?? '').toBe('');
    expect(columna('Monto pagado (S/)').valor(pedido)).toBe('');
    expect(columna('Modalidad de entrega').valor(pedido) ?? '').toBe('');
  });
});
