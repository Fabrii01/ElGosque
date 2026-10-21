import { describe, it, expect, vi, afterEach } from 'vitest';

// Firebase simulado: la prueba no se conecta a la base de datos real
vi.mock('../../src/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), addDoc: vi.fn(), serverTimestamp: vi.fn() }));

import { generarCodigoSolicitud } from '../../src/modules/solicitud-pedido/solicitudService';

// CA03 - Código único de solicitud (generarCodigoSolicitud) | REQ-F05-04
const sufijo = (codigo) => codigo.split('-').pop();

describe('CA03 - Código único de solicitud (generarCodigoSolicitud)', () => {
  afterEach(() => vi.useRealTimers());

  it('1.0 [+] Formato del código', () => {
    expect(generarCodigoSolicitud()).toMatch(/^REQ-\d{8}-[A-Z0-9]{6}$/);
  });

  it('2.0 [+] Prefijo del asistente de IA', () => {
    const codigo = generarCodigoSolicitud('IA-REQ');
    expect(codigo.startsWith('IA-REQ-')).toBe(true);
    expect(codigo).toMatch(/^IA-REQ-\d{8}-[A-Z0-9]{6}$/);
  });

  it('3.0 [+] Fecha del día en el código', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 19, 10, 30)); // 19/10/2026 (los meses empiezan en 0)
    expect(generarCodigoSolicitud()).toContain('20261019');
  });

  it('4.0 [+] Ciclo de 1000 códigos consecutivos', () => {
    const codigos = Array.from({ length: 1000 }, () => generarCodigoSolicitud());
    expect(new Set(codigos).size).toBe(1000);
  });

  it('5.0 [–] Sin caracteres ambiguos', () => {
    const sufijos = Array.from({ length: 500 }, () => sufijo(generarCodigoSolicitud()));
    expect(sufijos.filter(s => /[0O1I]/.test(s))).toEqual([]);
  });
});
