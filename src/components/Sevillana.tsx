import type { CSSProperties } from 'react';

/**
 * Separador decorativo con estilo de cerámica de Triana.
 * Motivo de azulejo con estrella de 8 puntas y línea ondulada.
 * Se coloca entre secciones para dar identidad sevillana.
 */
export function SeparadorTriana({ variant = 'light', className = '' }: { variant?: 'light' | 'dark'; className?: string }) {
  const stroke = variant === 'dark' ? '%23fefcf9' : '%2323402A';
  const op = variant === 'dark' ? '0.15' : '0.12';
  return (
    <div className={`flex items-center justify-center py-2 ${className}`} aria-hidden="true">
      <svg
        width="100%"
        height="28"
        viewBox="0 0 600 28"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: '600px' }}
      >
        <g fill="none" stroke={stroke.replace('%23', '#')} strokeOpacity={op} strokeWidth="1">
          <line x1="0" y1="14" x2="220" y2="14" />
          <line x1="380" y1="14" x2="600" y2="14" />
          <path d="M220 14 Q 240 4, 260 14 T 300 14 T 340 14 T 380 14" />
          <g transform="translate(300 14)">
            <rect x="-10" y="-10" width="20" height="20" />
            <rect x="-10" y="-10" width="20" height="20" transform="rotate(45)" />
            <circle r="4" />
          </g>
        </g>
      </svg>
    </div>
  );
}

/**
 * Mapa estilizado de la zona de entrega de Sevilla.
 * Muestra Sevilla Capital y las zonas de alrededores (hasta 18 km)
 * con un estilo visual de azulejo sevillano.
 */
export function MapaSevilla({ className = '' }: { className?: string }) {
  const zonas = [
    { label: 'Sevilla Capital', x: 150, y: 140, r: 22, highlight: true },
    { label: 'Tomares', x: 108, y: 128, r: 12 },
    { label: 'San Juan', x: 120, y: 162, r: 11 },
    { label: 'Mairena', x: 92, y: 148, r: 10 },
    { label: 'Camas', x: 118, y: 108, r: 10 },
    { label: 'Coria', x: 82, y: 112, r: 9 },
    { label: 'Gines', x: 78, y: 132, r: 9 },
    { label: 'Bormujos', x: 70, y: 118, r: 9 },
    { label: 'Valencina', x: 100, y: 88, r: 8 },
    { label: 'Santiponce', x: 128, y: 88, r: 8 },
    { label: 'La Rinconada', x: 170, y: 92, r: 9 },
    { label: 'Alcalá de Guad.', x: 210, y: 110, r: 10 },
    { label: 'Dos Hermanas', x: 200, y: 178, r: 11 },
    { label: 'Gelves', x: 128, y: 200, r: 9 },
    { label: 'Pilas', x: 60, y: 158, r: 8 },
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 azulejo-bg ${className}`}>
      <div className="border-b border-cream-300 bg-primary-700 px-5 py-3 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cream-100">Zonas de entrega en Sevilla</p>
      </div>
      <svg viewBox="0 0 300 260" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="azulejoMap" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#23402A" strokeOpacity="0.04" strokeWidth="0.5">
              <rect x="8" y="8" width="24" height="24" />
              <rect x="8" y="8" width="24" height="24" transform="rotate(45 20 20)" />
            </g>
          </pattern>
        </defs>
        <rect width="300" height="260" fill="url(#azulejoMap)" />

        <circle cx={150} cy={140} r={70} fill="none" stroke="#23402A" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={150} cy={140} r={100} fill="none" stroke="#23402A" strokeOpacity="0.05" strokeWidth="1" strokeDasharray="3 5" />

        <path d="M60 100 Q 90 70, 130 75 Q 180 80, 230 95 Q 250 130, 235 180 Q 200 215, 140 210 Q 80 205, 55 170 Q 45 130, 60 100 Z"
          fill="none" stroke="#D9C49C" strokeOpacity="0.3" strokeWidth="1.5" />

        {zonas.map((z) => (
          <g key={z.label}>
            <circle
              cx={z.x}
              cy={z.y}
              r={z.r}
              fill={z.highlight ? '#23402A' : '#D9C49C'}
              fillOpacity={z.highlight ? 0.9 : 0.55}
              stroke={z.highlight ? '#A68C5B' : '#D9C49C'}
              strokeWidth={z.highlight ? '2' : '1'}
            >
              {z.highlight && (
                <animate
                  attributeName="r"
                  values={`${z.r};${z.r + 3};${z.r}`}
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
            <text
              x={z.x}
              y={z.y + z.r + 10}
              textAnchor="middle"
              fontSize={z.highlight ? '7.5' : '6'}
              fill={z.highlight ? '#23402A' : '#5f594a'}
              fontWeight={z.highlight ? '700' : '600'}
              fontFamily="Manrope, sans-serif"
            >
              {z.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-3 gap-2 border-t border-cream-300 px-4 py-3 text-center">
        <div>
          <span className="block h-3 w-3 rounded-full bg-primary-700 mx-auto" />
          <p className="mt-1 text-[10px] font-bold text-primary-800">Capital</p>
        </div>
        <div>
          <span className="block h-3 w-3 rounded-full bg-cream-300 mx-auto" />
          <p className="mt-1 text-[10px] font-bold text-secondary-600">Hasta 18 km</p>
        </div>
        <div>
          <span className="block h-3 w-3 rounded-full border-2 border-accent-500 bg-cream-50 mx-auto" />
          <p className="mt-1 text-[10px] font-bold text-secondary-600">+18 km consulta</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Icono decorativo: naranja de Sevilla (motivo circular con hoja).
 * Sustituye iconos genéricos en contextos decorativos.
 */
export function NaranjaIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="13.5" r="8" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 5.5 C 10 3, 11 1.5, 13 0.5 C 13.5 2, 13 4, 12 5.5 Z" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="0.8" />
      <line x1="12" y1="5.5" x2="12" y2="3" stroke="currentColor" strokeWidth="1" />
      <circle cx="9.5" cy="11" r="1.2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="14.5" cy="11" r="1.2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

/**
 * Icono decorativo: abanico español simplificado.
 */
export function AbanicoIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21 L 4 13 A 10 10 0 0 1 20 13 Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.3" />
      <line x1="12" y1="21" x2="6.5" y2="12.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="12" y1="21" x2="9.5" y2="11.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="12" y1="21" x2="12" y2="11" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="12" y1="21" x2="14.5" y2="11.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
      <line x1="12" y1="21" x2="17.5" y2="12.5" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
      <circle cx="12" cy="21" r="1.2" fill="currentColor" />
    </svg>
  );
}

/**
 * Icono decorativo: estrella de azulejo sevillano (8 puntas).
 */
export function AzulejoStarIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" strokeWidth="1.3" fill="currentColor" fillOpacity="0.08">
        <rect x="6" y="6" width="12" height="12" />
        <rect x="6" y="6" width="12" height="12" transform="rotate(45 12 12)" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="none" />
      </g>
    </svg>
  );
}
