import { describe, it, expect } from 'vitest';
import {
  ESTADOS_CON_PRECIO_EDITABLE, crearProductosEditables, recalcularProductos, calcularTotalAcordado, validarProductosAcordados,
} from '../../src/modules/gestion-pedidos/preciosAcordados';

// CA06 - Cantidad y precio final acordado (preciosAcordados.js) | REQ-F08-02, REQ-F08-03, REQ-F08-08
const producto = (cantidad, precioUnitario) => ({ nombre: 'Geisha', cantidad, precioUnitario });
const ERROR_CANTIDAD = 'Las cantidades deben ser números enteros mayores que 0.';
const ERROR_PRECIO = 'Los precios no pueden estar vacíos ni ser negativos.';

describe('CA06 - Cantidad y precio final acordado (preciosAcordados.js)', () => {
  it('1.0 [+] Subtotal acordado', () => {
    expect(recalcularProductos([producto(3, 12.5)])[0].subtotal).toBe(37.5);
  });

  it('2.0 [+] Redondeo a 2 decimales', () => {
    expect(3 * 0.1).not.toBe(0.3); // en JavaScript 3 * 0.1 = 0.30000000000000004
    expect(recalcularProductos([producto(3, 0.1)])[0].subtotal).toBe(0.3);
  });

  it('3.0 [+] Total acordado', () => {
    expect(calcularTotalAcordado([producto(2, 45), { nombre: 'Verde Premium', cantidad: 5, precioUnitario: 30 }])).toBe(240);
  });

  it('4.0 [+] Datos válidos para registrar el pago', () => {
    expect(validarProductosAcordados('Pagado', [producto(2, 45)])).toBeNull();
  });

  it('5.0 [–] Cantidad decimal', () => {
    expect(validarProductosAcordados('Vendido', [producto(1.5, 10)])).toBe(ERROR_CANTIDAD);
  });

  it('6.0 [–] Cantidad cero o con letras', () => {
    expect(validarProductosAcordados('Vendido', [producto(0, 10)])).toBe(ERROR_CANTIDAD);
    expect(validarProductosAcordados('Vendido', [producto('abc', 10)])).toBe(ERROR_CANTIDAD);
  });

  it('7.0 [–] Precio negativo', () => {
    expect(validarProductosAcordados('Vendido', [producto(2, -5)])).toBe(ERROR_PRECIO);
  });

  it('8.0 [–] Precio vacío', () => {
    expect(validarProductosAcordados('Vendido', [producto(2, '')])).toBe(ERROR_PRECIO);
  });

  it('9.0 [–] Marcar como Pagado con total cero', () => {
    expect(validarProductosAcordados('Pagado', [producto(2, 0)])).toBe('Registra el precio acordado antes de marcar el pedido como Pagado.');
  });

  it('10.0 [+] Solicitud pendiente sin precio', () => {
    expect(validarProductosAcordados('Pendiente', [producto(2, 0)])).toBeNull();
  });

  it('11.0 [–] Datos de la solicitud con valores inválidos', () => {
    const [editable] = crearProductosEditables([{ nombre: 'Geisha', cantidad: 'abc' }]);
    expect(editable.cantidad).toBe(1);
    expect(editable.precioUnitario).toBe(0);
  });

  it('12.0 [+] Estados con precio editable', () => {
    expect(ESTADOS_CON_PRECIO_EDITABLE).toEqual(['Pendiente']);
    expect(ESTADOS_CON_PRECIO_EDITABLE).not.toContain('Pagado');
  });
});
