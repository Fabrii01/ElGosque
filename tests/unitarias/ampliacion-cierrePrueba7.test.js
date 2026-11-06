import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Ampliación posterior al plan: correcciones finales de la Prueba 7
const { auth, firebaseAuth } = vi.hoisted(() => ({
  auth: { currentUser: null },
  firebaseAuth: { sendPasswordResetEmail: vi.fn(), sendEmailVerification: vi.fn(), reload: vi.fn(), signInWithEmailAndPassword: vi.fn(), signOut: vi.fn(), onAuthStateChanged: vi.fn() },
}));

vi.mock('../../src/firebase', () => ({ auth, db: {} }));
vi.mock('firebase/auth', () => firebaseAuth);
vi.mock('firebase/firestore', () => ({ doc: vi.fn(), getDoc: vi.fn() }));

import { MODELOS_GROQ, consultarGroq } from '../../src/modules/asistente-ia/groqService';
import { MODELOS_PERMITIDOS } from '../../servidor-ia/src/index';
import { obtenerTokenVerificado, recuperarContrasena } from '../../src/modules/inicio-sesion/sesionService';
import { productosConPrecioDistinto } from '../../src/modules/gestion-pedidos/preciosAcordados';
import { debeRecargar } from '../../src/shared/utils/nuevaVersion';

const URL = 'https://ia.ejemplo.dev/';
const mensajes = [{ role: 'user', content: 'Hola' }];
const usuarioVerificado = () => ({ getIdTokenResult: vi.fn().mockResolvedValue({ token: 'token-1', claims: { email_verified: true } }) });

beforeEach(() => {
  vi.clearAllMocks();
  auth.currentUser = null;
});

afterEach(() => { vi.unstubAllGlobals(); });

describe('Ampliación - Consulta al asistente por el intermediario (groqService.js)', () => {
  it('[+] Los modelos del navegador son los que permite el intermediario', () => {
    expect(MODELOS_GROQ).toEqual(MODELOS_PERMITIDOS);
  });

  it('[+] Envía el token de la sesión y ninguna clave de Groq', async () => {
    auth.currentUser = usuarioVerificado();
    const pedir = vi.fn().mockResolvedValue(Response.json({ choices: [{ message: { content: ' Hola ' } }] }));
    vi.stubGlobal('fetch', pedir);
    await expect(consultarGroq(mensajes, URL)).resolves.toBe('Hola');
    const [url, opciones] = pedir.mock.calls[0];
    expect(url).toBe(URL);
    expect(opciones.headers.Authorization).toBe('Bearer token-1');
    expect(JSON.parse(opciones.body)).toEqual({ modelo: MODELOS_GROQ[0], mensajes });
  });

  it('[–] Sin correo verificado no llama al intermediario', async () => {
    auth.currentUser = { emailVerified: false, getIdToken: vi.fn(), getIdTokenResult: vi.fn().mockResolvedValue({ token: 't', claims: {} }) };
    const pedir = vi.fn();
    vi.stubGlobal('fetch', pedir);
    await expect(consultarGroq(mensajes, URL)).rejects.toMatchObject({ code: 'correo-sin-verificar' });
    expect(pedir).not.toHaveBeenCalled();
  });

  it('[–] Sin URL configurada avisa del problema', async () => {
    await expect(consultarGroq(mensajes, '')).rejects.toThrow('URL_ASISTENTE');
  });

  it('[–] Un 403 del intermediario no se reintenta', async () => {
    auth.currentUser = usuarioVerificado();
    const pedir = vi.fn().mockResolvedValue(new Response('{}', { status: 403 }));
    vi.stubGlobal('fetch', pedir);
    await expect(consultarGroq(mensajes, URL)).rejects.toThrow('403');
    expect(pedir).toHaveBeenCalledTimes(1);
  });
});

describe('Ampliación - Token para el intermediario (sesionService.js)', () => {
  it('[+] Con token verificado no fuerza la renovación', async () => {
    const usuario = { ...usuarioVerificado(), getIdToken: vi.fn() };
    auth.currentUser = usuario;
    await expect(obtenerTokenVerificado()).resolves.toBe('token-1');
    expect(usuario.getIdToken).not.toHaveBeenCalled();
  });

  it('[+] Si verificó después de iniciar sesión, renueva el token', async () => {
    auth.currentUser = {
      emailVerified: true,
      getIdTokenResult: vi.fn().mockResolvedValue({ token: 'viejo', claims: { email_verified: false } }),
      getIdToken: vi.fn().mockResolvedValue('nuevo'),
    };
    await expect(obtenerTokenVerificado()).resolves.toBe('nuevo');
  });

  it('[–] Sin sesión devuelve null', async () => {
    await expect(obtenerTokenVerificado()).resolves.toBeNull();
  });
});

describe('Ampliación - Recuperación de contraseña', () => {
  it('[+] Pide a Firebase el enlace para ese correo', async () => {
    await recuperarContrasena('ana@correo.com');
    expect(firebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'ana@correo.com');
  });
});

describe('Ampliación - Precios de la solicitud contra el catálogo (preciosAcordados.js)', () => {
  const catalogo = [{ nombre: 'Gourmet', peso: '1 kg', precioReferencial: '40' }, { nombre: 'Geisha', peso: '1 kg', precioReferencial: '90' }];
  const item = (nombre, precioUnitario, peso = '1 kg') => ({ nombre, peso, precioUnitario });

  it('[+] Precios iguales al catálogo, aunque uno sea texto y otro número', () => {
    expect(productosConPrecioDistinto([item('Gourmet', 40), item('Geisha', 90)], catalogo)).toEqual([]);
  });

  it('[–] Detecta un precio alterado', () => {
    expect(productosConPrecioDistinto([item('Gourmet', 1), item('Geisha', 90)], catalogo).map(p => p.nombre)).toEqual(['Gourmet']);
  });

  it('[–] Detecta un producto o tamaño que no está en el catálogo', () => {
    expect(productosConPrecioDistinto([item('Inventado', 40), item('Gourmet', 40, '5 kg')], catalogo)).toHaveLength(2);
  });

  it('[+] Sin catálogo cargado no genera falsas alertas', () => {
    expect(productosConPrecioDistinto([item('Gourmet', 1)], [])).toEqual([]);
  });
});

describe('Ampliación - Recarga ante una versión antigua (nuevaVersion.js)', () => {
  it('[+] Recarga si no lo hizo antes o pasó el tiempo de espera', () => {
    expect(debeRecargar(null, 100000)).toBe(true);
    expect(debeRecargar('1000', 100000)).toBe(true);
  });

  it('[–] No repite la recarga en seguida, para evitar un ciclo', () => {
    expect(debeRecargar('90000', 100000)).toBe(false);
  });
});
