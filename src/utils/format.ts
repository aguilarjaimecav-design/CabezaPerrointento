export function formatPrice(value: number): string {
  return value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
}

export function displayPrice(value: number): string {
  return value > 0 ? formatPrice(value) : 'Consultar precio';
}
