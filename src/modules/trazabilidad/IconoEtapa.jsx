import { claveEtapa } from './etapas';

// Ícono de línea para cada etapa del proceso (24 × 24)
const TRAZOS = {
  semilla: <><ellipse cx="12" cy="15" rx="5" ry="6.5" /><path d="M12 8.6c-1.8 2-1.8 4.4 0 6.4s1.8 4.4 0 6.4" /><path d="M12 8.5C12 5.5 14 3.5 17.5 3.2c-.2 3-2.4 4.8-5.5 5.3" /></>,
  cultivo: <><path d="M12 21V10" /><path d="M12 14c-4 0-6.5-2.2-6.5-5.5 3.4 0 6.5 2.2 6.5 5.5z" /><path d="M12 11c0-3.4 2.4-6 6.5-6 0 3.6-2.6 6-6.5 6z" /><path d="M6 21h12" /></>,
  cosecha: <><path d="M3.5 5.5c5 .8 9.4 4.2 12 10.5" /><path d="M7 6.4c.2-2 1.6-3.2 3.6-3.1-.1 2-1.6 3.2-3.6 3.1z" /><circle cx="9.5" cy="11" r="2.2" /><circle cx="13" cy="14.5" r="2.2" /><circle cx="16.5" cy="18.5" r="2.2" /></>,
  despulpado: <><path d="M9 6.5a5.5 5.5 0 0 0 0 11" /><path d="M15 6.5a5.5 5.5 0 0 1 0 11" /><ellipse cx="12" cy="12" rx="2" ry="3" /></>,
  fermentacion: <><rect x="6" y="7" width="12" height="14" rx="2" /><path d="M8 4h8M6 11h12" /><circle cx="10" cy="15" r="1" /><circle cx="14" cy="17" r="1" /><circle cx="13" cy="14" r=".6" /></>,
  lavado: <><path d="M10 3c3 4.4 5 7.4 5 10a5 5 0 0 1-10 0c0-2.6 2-5.6 5-10z" /><path d="M18.5 12c1 1.5 1.7 2.5 1.7 3.4a1.7 1.7 0 0 1-3.4 0c0-.9.7-1.9 1.7-3.4z" /></>,
  secado: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" /></>,
  tostado: <><path d="M12 3c1 3.6 5 5.6 5 10a5 5 0 0 1-10 0c0-2.6 1.5-4.2 2.6-5.2.3 1.6 1 2.6 2 3.1-.2-3 0-5.2.4-7.9z" /></>,
  empaquetado: <><path d="M5.5 8h13l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H8.2a1.5 1.5 0 0 1-1.5-1.3L5.5 8z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /><path d="M9.5 13h5" /></>,
};
const GRANO = <><ellipse cx="12" cy="12" rx="6" ry="8.5" /><path d="M12 3.7c-2.2 2.6-2.2 5.6 0 8.3s2.2 5.7 0 8.3" /></>;

const IconoEtapa = ({ nombre, className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {TRAZOS[claveEtapa(nombre)] || GRANO}
  </svg>
);

export default IconoEtapa;
