import { describe, it, expect } from 'vitest';
import { METODOS_PAGO, requiereComprobante, validarPago, tienePagoRegistrado, crearPagoInicial } from '../../src/modules/pagos/pago';

// CA07 - Registro de pagos (pago.js) | REQ-F09-01, REQ-F09-02, REQ-F09-03, REQ-F09-04
// Regla vigente: en Yape, Plin y Transferencia se exige la captura del comprobante (el nro. de operación ya no se pide)
const CAPTURA = 'data:image/jpeg;base64,/9j/4AAQ';
const pago = (cambios) => ({ metodo: 'Yape', monto: '480', fecha: '2026-10-20', nroOperacion: '', constanciaImagen: CAPTURA, ...cambios });
const ERROR_DATOS = 'Para marcar como Pagado registra medio, monto y fecha de pago.';
const ERROR_CAPTURA = 'Adjunta la captura del comprobante de pago.';

describe('CA07 - Registro de pagos (pago.js)', () => {
  it('1.0 [+] Medios de pago autorizados', () => {
    expect(METODOS_PAGO).toEqual(['Efectivo', 'Yape', 'Plin', 'Transferencia Bancaria', 'Otro']);
  });

  it('2.0 [+] Medios que exigen captura del comprobante', () => {
    expect(requiereComprobante('Yape')).toBe(true);
    expect(requiereComprobante('Plin')).toBe(true);
    expect(requiereComprobante('Transferencia Bancaria')).toBe(true);
  });

  it('3.0 [–] Efectivo no exige captura del comprobante', () => {
    expect(requiereComprobante('Efectivo')).toBe(false);
  });

  it('4.0 [+] Pago digital completo', () => {
    expect(validarPago('Pagado', pago())).toBeNull();
  });

  it('5.0 [+] Pago en efectivo sin captura', () => {
    expect(validarPago('Pagado', pago({ metodo: 'Efectivo', constanciaImagen: '' }))).toBeNull();
  });

  it('6.0 [–] Pago digital sin captura del comprobante', () => {
    expect(validarPago('Pagado', pago({ constanciaImagen: '' }))).toBe(ERROR_CAPTURA);
  });

  it('7.0 [–] Pago digital con nro. de operación pero sin captura', () => {
    expect(validarPago('Pagado', pago({ metodo: 'Plin', nroOperacion: '00123456', constanciaImagen: '' }))).toBe(ERROR_CAPTURA);
  });

  it('8.0 [–] Pago sin monto', () => {
    expect(validarPago('Pagado', pago({ metodo: 'Efectivo', monto: '', constanciaImagen: '' }))).toBe(ERROR_DATOS);
  });

  it('9.0 [–] Pago sin fecha o sin medio', () => {
    expect(validarPago('Pagado', pago({ fecha: '' }))).toBe(ERROR_DATOS);
    expect(validarPago('Pagado', pago({ metodo: '' }))).toBe(ERROR_DATOS);
  });

  it('10.0 [+] Otros estados no validan el pago', () => {
    expect(validarPago('Enviado', crearPagoInicial())).toBeNull();
  });

  it('11.0 [–] Pedido sin datos de pago', () => {
    expect(tienePagoRegistrado(undefined)).toBe(false);
  });

  it('12.0 [+] Formulario inicial de pago', () => {
    expect(crearPagoInicial()).toEqual({ metodo: '', monto: '', fecha: '', nroOperacion: '' });
  });
});

// Corrección detectada al ejecutar CA07 (fuera de las filas del plan)
describe('Corrección CA07 - Monto pagado inválido', () => {
  it('[–] Monto negativo, cero o con letras', () => {
    for (const monto of ['-5', '0', 'abc']) {
      expect(validarPago('Pagado', pago({ metodo: 'Efectivo', monto, constanciaImagen: '' }))).toBe('El monto pagado debe ser un número mayor que 0.');
    }
  });
});
