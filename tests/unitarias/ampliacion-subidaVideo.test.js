import { describe, it, expect, vi, afterEach } from 'vitest';

// Firebase simulado: cafeteriaService lo importa, pero la subida de videos no lo usa
vi.mock('../../src/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({}));

import { subirVideoCafeteria } from '../../src/modules/cafeteria/cafeteriaService';

// Ampliación posterior al plan: subida de videos a Cloudinary (XMLHttpRequest simulado; no se sube nada real)
const simularXHR = ({ status, respuesta, progreso = [] }) => {
  const enviadas = [];
  class XHRFalso {
    upload = {};
    open(metodo, url) { this.metodo = metodo; this.url = url; }
    send(datos) {
      enviadas.push({ metodo: this.metodo, url: this.url, datos });
      progreso.forEach(([loaded, total]) => this.upload.onprogress?.({ lengthComputable: true, loaded, total }));
      this.status = status;
      this.responseText = JSON.stringify(respuesta);
      this.onload();
    }
  }
  vi.stubGlobal('XMLHttpRequest', XHRFalso);
  return enviadas;
};
const video = new File(['contenido'], 'metodo-v60.mp4', { type: 'video/mp4' });

describe('Ampliación - Subida de videos a Cloudinary (cafeteriaService.js)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('[+] Envía el archivo con el preset y devuelve el enlace https del video', async () => {
    const enlace = 'https://res.cloudinary.com/ukht0909/video/upload/v1/cafeteria/videos/metodo-v60.mp4';
    const enviadas = simularXHR({ status: 200, respuesta: { secure_url: enlace }, progreso: [[50, 100], [100, 100]] });
    const avances = [];

    await expect(subirVideoCafeteria(video, p => avances.push(p))).resolves.toBe(enlace);
    expect(enviadas[0].metodo).toBe('POST');
    expect(enviadas[0].url).toBe('https://api.cloudinary.com/v1_1/ukht0909/video/upload');
    expect(enviadas[0].datos.get('upload_preset')).toBe('gosque_videos');
    expect(enviadas[0].datos.get('file').name).toBe('metodo-v60.mp4');
    expect(avances).toEqual([50, 100]);
  });

  it('[–] Cloudinary rechaza la subida: se muestra su mensaje', async () => {
    simularXHR({ status: 400, respuesta: { error: { message: 'Upload preset not found' } } });
    await expect(subirVideoCafeteria(video)).rejects.toThrow('Upload preset not found');
  });
});
