import { describe, it, expect } from 'vitest';
import { claveEtapa, faseDeEtapa, claveFase } from '../../src/modules/trazabilidad/etapas';

// CA18 - Etapas de trazabilidad (etapas.js) | REQ-F04-01, REQ-F04-04
const ETAPAS = ['Semilla', 'Cultivo', 'Cosecha', 'Despulpado', 'Fermentación', 'Lavado', 'Secado', 'Tostado', 'Empaquetado'];

describe('CA18 - Etapas de trazabilidad (etapas.js)', () => {
  it('1.0 [+] Normalizar el nombre de una etapa', () => {
    expect(claveEtapa('Fermentación')).toBe('fermentacion');
    expect(claveEtapa('Despulpado ')).toBe('despulpado');
  });

  it('2.0 [+] Fase de las 9 etapas', () => {
    expect(ETAPAS.map((nombre, i) => faseDeEtapa(nombre, i, 9))).toEqual([
      'campo', 'campo', 'campo',
      'beneficio', 'beneficio', 'beneficio', 'beneficio',
      'planta', 'planta',
    ]);
  });

  it('3.0 [–] Etapa con nombre no reconocido', () => {
    expect([0, 4, 8].map(i => faseDeEtapa('Molienda', i, 9))).toEqual(['campo', 'beneficio', 'planta']);
  });

  it('4.0 [–] Nombre vacío', () => {
    expect(() => claveEtapa()).not.toThrow();
    expect(claveEtapa()).toBe('');
  });

  it('5.0 [+] Fase indicada explícitamente', () => {
    expect(claveFase({ nombre: 'Semilla', fase: 'planta' }, 0, 9)).toBe('planta');
  });
});
