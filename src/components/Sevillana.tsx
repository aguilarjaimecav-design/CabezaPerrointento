/**
 * Mapa estilizado con la forma real de la provincia de Sevilla.
 * Muestra Sevilla Capital y las zonas de entrega de los alrededores.
 */
export function MapaSevilla({ className = '' }: { className?: string }) {
  const zonas = [
    { label: 'Sevilla', x: 188, y: 175, highlight: true },
    { label: 'Tomares', x: 168, y: 168 },
    { label: 'San Juan', x: 175, y: 188 },
    { label: 'Mairena', x: 158, y: 178 },
    { label: 'Camas', x: 175, y: 158 },
    { label: 'Coria', x: 148, y: 162 },
    { label: 'Gines', x: 145, y: 175 },
    { label: 'Bormujos', x: 140, y: 168 },
    { label: 'Valencina', x: 160, y: 145 },
    { label: 'Santiponce', x: 180, y: 148 },
    { label: 'La Rinconada', x: 205, y: 152 },
    { label: 'Alcalá', x: 235, y: 160 },
    { label: 'Dos Hermanas', x: 220, y: 200 },
    { label: 'Gelves', x: 185, y: 210 },
    { label: 'Pilas', x: 125, y: 185 },
    { label: 'Carmona', x: 245, y: 170 },
    { label: 'Estepa', x: 270, y: 215 },
    { label: 'Osuna', x: 250, y: 210 },
    { label: 'Écija', x: 240, y: 145 },
    { label: 'Marchena', x: 230, y: 195 },
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-cream-300 bg-cream-50 ${className}`}>
      <div className="border-b border-cream-300 bg-primary-700 px-5 py-3 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cream-100">Zonas de entrega · Provincia de Sevilla</p>
      </div>
      <svg viewBox="0 0 340 290" className="w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="azulejoMap" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="#23402A" strokeOpacity="0.035" strokeWidth="0.5">
              <rect x="6" y="6" width="18" height="18" />
              <rect x="6" y="6" width="18" height="18" transform="rotate(45 15 15)" />
            </g>
          </pattern>
          <linearGradient id="provFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8DCC4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D4C19E" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <rect width="340" height="290" fill="url(#azulejoMap)" />

        {/* Forma real aproximada de la provincia de Sevilla */}
        <path
          d="M 90 60
             L 120 50 L 155 48 L 185 52 L 210 58
             L 235 55 L 260 62 L 280 75 L 295 95
             L 300 120 L 290 145 L 295 165
             L 285 185 L 275 205 L 260 225
             L 240 240 L 215 250 L 190 248
             L 165 245 L 140 240 L 120 228
             L 100 210 L 85 188 L 78 165
             L 72 140 L 75 115 L 80 90 L 90 60 Z"
          fill="url(#provFill)"
          stroke="#A68C5B"
          strokeWidth="1.5"
          strokeOpacity="0.5"
        />

        {/* Río Guadalquivir (linea que cruza la provincia) */}
        <path
          d="M 100 90 Q 130 120, 160 140 Q 190 165, 210 185 Q 235 210, 255 230"
          fill="none"
          stroke="#7BA0BC"
          strokeWidth="1.8"
          strokeOpacity="0.3"
          strokeDasharray="3 2"
        />

        {/* Anillo de 18 km alrededor de Sevilla Capital */}
        <circle cx={188} cy={175} r={38} fill="none" stroke="#23402A" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="3 3" />

        {/* Marcador Giralda para Sevilla Capital */}
        <g transform="translate(188 175)">
          <circle r="7" fill="#23402A" fillOpacity="0.15">
            <animate attributeName="r" values="7;12;7" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity" values="0.15;0.03;0.15" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle r="4.5" fill="#23402A" />
          <text y="-9" textAnchor="middle" fontSize="8" fontWeight="800" fill="#23402A" fontFamily="Manrope, sans-serif">Sevilla</text>
        </g>

        {/* Puntos de municipios de entrega */}
        {zonas.filter(z => !z.highlight).map((z) => {
          const inRange = Math.hypot(z.x - 188, z.y - 175) <= 38;
          return (
            <g key={z.label}>
              <circle
                cx={z.x}
                cy={z.y}
                r={inRange ? 2.8 : 2}
                fill={inRange ? '#A68C5B' : '#D4C19E'}
                fillOpacity={inRange ? 0.7 : 0.5}
              />
              <text
                x={z.x}
                y={z.y - 4}
                textAnchor="middle"
                fontSize="5.5"
                fill="#5f594a"
                fontWeight="600"
                fontFamily="Manrope, sans-serif"
              >
                {z.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-3 gap-2 border-t border-cream-300 px-4 py-3 text-center">
        <div>
          <span className="block h-3 w-3 rounded-full bg-primary-700 mx-auto" />
          <p className="mt-1 text-[10px] font-bold text-primary-800">Capital</p>
        </div>
        <div>
          <span className="block h-3 w-3 rounded-full bg-cream-300 mx-auto ring-1 ring-accent-500/40" />
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
 * Icono decorativo: silueta de la Giralda de Sevilla.
 * Torre con cuerpo principal, campanario de arcos y remate con cruz.
 */
export function GiraldaIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Cuerpo de la torre */}
      <rect x="8.5" y="10" width="7" height="10" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.2" />
      {/* Campanario */}
      <rect x="7.5" y="6" width="9" height="4" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      {/* Arcos del campanario */}
      <path d="M9 10 L9 8 Q9 7, 9.8 7 Q10.5 7, 10.5 8 L10.5 10" fill="none" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.6" />
      <path d="M11 10 L11 8 Q11 7, 11.8 7 Q12.5 7, 12.5 8 L12.5 10" fill="none" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.6" />
      <path d="M13 10 L13 8 Q13 7, 13.8 7 Q14.5 7, 14.5 8 L14.5 10" fill="none" stroke="currentColor" strokeWidth="0.7" strokeOpacity="0.6" />
      {/* Remate: linterna */}
      <rect x="10.5" y="4" width="3" height="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.9" />
      {/* Cruz superior */}
      <line x1="12" y1="4" x2="12" y2="1.5" stroke="currentColor" strokeWidth="1" />
      <line x1="10.8" y1="2.5" x2="13.2" y2="2.5" stroke="currentColor" strokeWidth="1" />
      {/* Base */}
      <rect x="7.5" y="20" width="9" height="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
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
