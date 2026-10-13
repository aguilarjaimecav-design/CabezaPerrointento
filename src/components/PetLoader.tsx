export function PetLoader({ label = 'Cargando…', dark = false }: { label?: string; dark?: boolean }) {
  return (
    <div className="pet-loader" role="status" aria-live="polite">
      <div className="pet-loader-scene">
        <div className="pet-loader-ground" />
        <svg className="pet-loader-paw" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <ellipse cx="20" cy="44" rx="5" ry="7" fill="currentColor" />
          <ellipse cx="30" cy="34" rx="4" ry="5" fill="currentColor" />
          <ellipse cx="40" cy="34" rx="4" ry="5" fill="currentColor" />
          <ellipse cx="50" cy="40" rx="5" ry="6" fill="currentColor" />
          <ellipse cx="44" cy="20" rx="9" ry="11" fill="currentColor" />
          <ellipse cx="44" cy="14" rx="3.5" ry="4" fill="currentColor" />
          <ellipse cx="37" cy="13" rx="2.5" ry="3" fill="currentColor" />
        </svg>
      </div>
      <p className={`pet-loader-label ${dark ? 'pet-loader-label-dark' : ''}`}>{label}</p>
    </div>
  );
}
