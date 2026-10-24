import { describe, it, expect } from 'vitest';
import { MODALIDADES_ENVIO, validarEnvio, tieneDatosEnvio, crearEnvioInicial } from '../../src/modules/envios/envio';
import { validarEntrega } from '../../src/modules/entregas/entrega';

// CA08 - Envíos y entregas (envio.js y entrega.js) | REQ-F10-01, REQ-F10-02, REQ-F10-03, REQ-F10-04, REQ-F10-05
const envio = (cambios) => ({ modalidad: 'Agencia (Encomienda)', agencia: '', numeroGuia: '', fechaEnvio: '2026-10-21', ...cambios });
const ERROR_ENVIO = 'Para marcar como Enviado registra la modalidad y la fecha de despacho.';

describe('CA08 - Envíos y entregas (envio.js y entrega.js)', () => {
  it('1.0 [+] Modalidades de envío', () => {
    expect(MODALIDADES_ENVIO).toEqual(['Agencia (Encomienda)', 'Delivery Local', 'Recojo en Tienda']);
  });

  it('2.0 [+] Envío por agencia completo', () => {
    expect(validarEnvio('Enviado', envio())).toBeNull();
  });

  it('3.0 [+] Delivery sin número de guía', () => {
    expect(validarEnvio('Enviado', envio({ modalidad: 'Delivery Local', numeroGuia: '' }))).toBeNull();
  });

  it('4.0 [–] Enviado sin fecha de despacho', () => {
    expect(validarEnvio('Enviado', envio({ fechaEnvio: '' }))).toBe(ERROR_ENVIO);
  });

  it('5.0 [–] Enviado sin modalidad', () => {
    expect(validarEnvio('Enviado', envio({ modalidad: '' }))).toBe(ERROR_ENVIO);
  });

  it('6.0 [+] Otros estados no validan el envío', () => {
    expect(validarEnvio('Pagado', crearEnvioInicial())).toBeNull();
  });

  it('7.0 [+] Pedido con datos de envío', () => {
    expect(tieneDatosEnvio({ agencia: 'Olva Courier' })).toBe(true);
  });

  it('8.0 [–] Pedido sin datos de envío', () => {
    expect(tieneDatosEnvio({})).toBe(false);
    expect(tieneDatosEnvio(undefined)).toBe(false);
  });

  it('9.0 [+] Formulario inicial de envío', () => {
    expect(crearEnvioInicial()).toEqual({ modalidad: '', agencia: '', numeroGuia: '', fechaEnvio: '' });
  });

  it('10.0 [+] Marcar como Vendido un pedido enviado', () => {
    expect(validarEntrega('Vendido', envio({ modalidad: 'Delivery Local' }), 'Enviado')).toBeNull();
    expect(validarEntrega('Vendido', envio({ modalidad: 'Recojo en Tienda', fechaEnvio: '' }), 'Pagado')).toBeNull();
  });

  it('11.0 [–] Marcar como Vendido sin datos de envío o sin enviar', () => {
    expect(validarEntrega('Vendido', envio({ modalidad: '', fechaEnvio: '' }), 'Enviado')).toBe('Faltan datos de envío.');
    expect(validarEntrega('Vendido', envio({ modalidad: 'Delivery Local' }), 'Pagado')).toBe('Para marcar como Vendido sin pasar por Enviado, la modalidad debe ser «Recojo en Tienda».');
  });

  it('12.0 [+] Otros estados no validan la entrega', () => {
    expect(validarEntrega('Enviado', crearEnvioInicial())).toBeNull();
  });
});
