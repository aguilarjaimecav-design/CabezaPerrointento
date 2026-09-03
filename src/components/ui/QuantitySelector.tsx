import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  cantidad: number;
  onChange: (cantidad: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantitySelector({ cantidad, onChange, min = 1, max = 20, size = 'md' }: QuantitySelectorProps) {
  const dim = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <div className="inline-flex items-center rounded-full border border-secondary-200 bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, cantidad - 1))}
        disabled={cantidad <= min}
        aria-label="Disminuir cantidad"
        className={`${dim} flex items-center justify-center rounded-full text-primary-700 transition hover:bg-cream-100 disabled:opacity-30 disabled:hover:bg-transparent`}
      >
        <Minus size={16} />
      </button>
      <span className="w-8 text-center text-sm font-semibold text-primary-800">{cantidad}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, cantidad + 1))}
        disabled={cantidad >= max}
        aria-label="Aumentar cantidad"
        className={`${dim} flex items-center justify-center rounded-full text-primary-700 transition hover:bg-cream-100 disabled:opacity-30 disabled:hover:bg-transparent`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
