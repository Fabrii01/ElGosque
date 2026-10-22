import { describe, it, expect } from 'vitest';
import { variedadesParaPedido, construirPromptSistema } from '../../src/modules/asistente-ia/promptAsistente';

// Ampliación posterior al plan: instrucciones del asistente de IA (promptAsistente.js)
const producto = (id, nombre) => ({ id, nombre, tipo: 'Tostado', peso: '1 kg', precioReferencial: '45' });
const catalogo = [
  producto('p1', 'Gourmet'), producto('p2', 'Especial El Gosque'), producto('p3', 'Caracolillo'),
  producto('p4', 'Geisha'), producto('p5', 'Oro Negro'),
];

describe('Ampliación - Instrucciones del asistente de IA (promptAsistente.js)', () => {
  it('[+] Al iniciar un pedido ofrece solo las 4 variedades elegidas que estén en el catálogo', () => {
    expect(variedadesParaPedido(catalogo)).toEqual(['Especial El Gosque', 'Gourmet', 'Geisha', 'Oro Negro']);
    expect(variedadesParaPedido([producto('p1', 'Gourmet'), producto('p3', 'Caracolillo')])).toEqual(['Gourmet']);
  });

  it('[–] Si ninguna de las 4 está en el catálogo, ofrece las variedades del catálogo', () => {
    expect(variedadesParaPedido([producto('p3', 'Caracolillo')])).toEqual(['Caracolillo']);
  });

  it('[+] El prompt pide mostrar el total antes de confirmar y no menciona frecuencia ni precio referencial', () => {
    const prompt = construirPromptSistema({ userData: { nombre: 'Ana Torres' }, catalogo, trazabilidad: {} });
    expect(prompt).toContain('TOTAL de la compra');
    expect(prompt).toContain('preséntale primero solo estas variedades: Especial El Gosque, Gourmet, Geisha, Oro Negro');
    expect(prompt).not.toMatch(/Precio referencial|"frecuencia"/);
  });
});
