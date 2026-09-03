import { Product } from '@/types';

export interface ProductTag {
  label: string;
  className: string;
}

const TAG_STYLES: Record<string, string> = {
  primary: 'bg-primary-700 text-cream-50',
  accent: 'bg-accent-500 text-primary-800',
  success: 'bg-success-500 text-cream-50',
  neutral: 'bg-secondary-200 text-primary-800',
};

export function getProductTags(product: Product): ProductTag[] {
  const tags: ProductTag[] = [];
  const name = product.nombre.toLowerCase();
  const desc = product.descripcionBreve?.toLowerCase() ?? '';

  if (product.nuevo) {
    tags.push({ label: 'Nuevo', className: TAG_STYLES.primary });
  } else if (product.destacado) {
    tags.push({ label: 'Favorito', className: TAG_STYLES.primary });
  }

  if (name.includes('sin cereal') || name.includes('grain free') || name.includes('sincereal')) {
    tags.push({ label: 'Sin cereal', className: TAG_STYLES.accent });
  } else if (name.includes('bajo cereal') || name.includes('low grain')) {
    tags.push({ label: 'Bajo cereal', className: TAG_STYLES.accent });
  }

  if (name.includes('monoproteico') || desc.includes('monoproteico')) {
    tags.push({ label: 'Monoproteico', className: TAG_STYLES.success });
  }

  if (name.includes('esterilizado') || name.includes('castrado')) {
    tags.push({ label: 'Esterilizado', className: TAG_STYLES.neutral });
  }

  if (name.includes('cachorro') || name.includes('gatito') || name.includes('kitten') || name.includes('puppy')) {
    tags.push({ label: 'Cachorro', className: TAG_STYLES.neutral });
  }

  if (name.includes('senior') || name.includes('veterano') || name.includes('abuelo')) {
    tags.push({ label: 'Senior', className: TAG_STYLES.neutral });
  }

  if (name.includes('light') || name.includes('ligero') || desc.includes('control de peso')) {
    tags.push({ label: 'Light', className: TAG_STYLES.neutral });
  }

  if (name.includes('prescription') || name.includes('veterinario') || name.includes('digestive') || name.includes('renal') || name.includes('urinary')) {
    tags.push({ label: 'Vet', className: TAG_STYLES.success });
  }

  if (product.precioAnterior && product.precioAnterior > product.precio) {
    tags.push({ label: 'Oferta', className: TAG_STYLES.accent });
  }

  return tags.slice(0, 3);
}
