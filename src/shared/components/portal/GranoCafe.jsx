// Grano de café dibujado en SVG (ornamento del portal)
const GranoCafe = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 32" className={className} fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
    <ellipse cx="12" cy="16" rx="10" ry="14.5" />
    <path d="M12 2.2c-3.6 4.4-3.6 9.2 0 13.8s3.6 9.4 0 13.8" strokeLinecap="round" />
  </svg>
);

export default GranoCafe;
