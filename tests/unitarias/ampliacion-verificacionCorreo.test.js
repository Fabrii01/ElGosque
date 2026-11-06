import { describe, it, expect, vi, beforeEach } from 'vitest';

// Ampliación posterior al plan: registro con verificación de correo (Prueba 7, OWASP A07)
const { auth, firebaseAuth, firestore } = vi.hoisted(() => ({
  auth: { currentUser: null },
  firebaseAuth: {
    createUserWithEmailAndPassword: vi.fn(),
    sendEmailVerification: vi.fn(),
    deleteUser: vi.fn(),
    reload: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn(),
  },
  firestore: { doc: vi.fn(), setDoc: vi.fn(), getDoc: vi.fn(), collection: vi.fn(), addDoc: vi.fn(), serverTimestamp: vi.fn() },
}));

vi.mock('../../src/firebase', () => ({ auth, db: {} }));
vi.mock('firebase/auth', () => firebaseAuth);
vi.mock('firebase/firestore', () => firestore);

import { registrarCliente } from '../../src/modules/registro-clientes/registroService';
import { comprobarCorreoVerificado } from '../../src/modules/inicio-sesion/sesionService';
import { registrarSolicitud } from '../../src/modules/solicitud-pedido/solicitudService';

const datos = { nombre: ' Ana Torres ', negocio: 'Café Aroma', ciudad: 'Trujillo', telefono: '+51 987 654 321', email: 'Ana@Correo.com', password: 'clave-segura' };
const usuario = { uid: 'u1', email: 'ana@correo.com' };

beforeEach(() => {
  vi.resetAllMocks();
  auth.currentUser = null;
  firebaseAuth.createUserWithEmailAndPassword.mockResolvedValue({ user: usuario });
  firebaseAuth.sendEmailVerification.mockResolvedValue();
  firebaseAuth.deleteUser.mockResolvedValue();
  firestore.setDoc.mockResolvedValue();
});

describe('Ampliación - Registro con verificación de correo (registroService.js)', () => {
  it('[+] Guarda el teléfono normalizado y el correo de la cuenta, y envía la verificación', async () => {
    await registrarCliente(datos);
    expect(firestore.setDoc.mock.calls[0][1]).toMatchObject({ nombre: 'Ana Torres', telefono: '987654321', email: 'ana@correo.com', rol: 'cliente' });
    expect(firebaseAuth.sendEmailVerification).toHaveBeenCalledWith(usuario);
  });

  it('[–] Si no se puede guardar el perfil, revierte la cuenta y no envía correo', async () => {
    firestore.setDoc.mockRejectedValue(new Error('permission-denied'));
    await expect(registrarCliente(datos)).rejects.toThrow('permission-denied');
    expect(firebaseAuth.deleteUser).toHaveBeenCalledWith(usuario);
    expect(firebaseAuth.sendEmailVerification).not.toHaveBeenCalled();
  });

  it('[–] Si falla el envío del correo, el registro se mantiene (se puede reenviar)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    firebaseAuth.sendEmailVerification.mockRejectedValue({ code: 'auth/too-many-requests' });
    await expect(registrarCliente(datos)).resolves.toBeUndefined();
    expect(firebaseAuth.deleteUser).not.toHaveBeenCalled();
  });
});

describe('Ampliación - Comprobación del correo verificado (sesionService.js)', () => {
  it('[–] Sin sesión devuelve false', async () => {
    await expect(comprobarCorreoVerificado()).resolves.toBe(false);
  });

  it('[–] Correo sin verificar: devuelve false y no renueva el token', async () => {
    const getIdToken = vi.fn();
    auth.currentUser = { emailVerified: false, getIdToken };
    await expect(comprobarCorreoVerificado()).resolves.toBe(false);
    expect(getIdToken).not.toHaveBeenCalled();
  });

  it('[+] Correo verificado: renueva el token que lee firestore.rules', async () => {
    const getIdToken = vi.fn().mockResolvedValue('token');
    auth.currentUser = { emailVerified: true, getIdToken };
    await expect(comprobarCorreoVerificado()).resolves.toBe(true);
    expect(getIdToken).toHaveBeenCalledWith(true);
  });
});

describe('Ampliación - Pedidos solo con correo verificado (solicitudService.js)', () => {
  it('[–] Cliente sin verificar: no se registra el pedido', async () => {
    auth.currentUser = { emailVerified: false, getIdToken: vi.fn() };
    await expect(registrarSolicitud({ codigo: 'REQ-1' })).rejects.toMatchObject({ code: 'correo-sin-verificar' });
    expect(firestore.addDoc).not.toHaveBeenCalled();
  });

  it('[+] Cliente verificado: se registra el pedido', async () => {
    auth.currentUser = { emailVerified: true, getIdToken: vi.fn().mockResolvedValue('token') };
    firestore.addDoc.mockResolvedValue({ id: 'p1' });
    await registrarSolicitud({ codigo: 'REQ-1' });
    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
  });
});
