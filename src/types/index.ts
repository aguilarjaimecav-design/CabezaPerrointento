export type Especie = 'perro' | 'gato';

export type Categoria = 'pienso-perros' | 'pienso-gatos' | 'humeda-perros' | 'humeda-gatos' | 'Complementos';

export interface NutrienteInfo {
  etiqueta: string;
  valor: string;
}

export interface Variante {
  formato: string;
  precio: number;
  precioAnterior?: number;
}

export interface Product {
  id: string;
  nombre: string;
  marca: string;
  categoria: Categoria;
  subcategoria?: string;
  especie: Especie;
  formato: string;
  precio: number;
  precioAnterior?: number;
  variantes: Variante[];
  valoracion: number;
  numValoraciones: number;
  descripcionBreve: string;
  descripcionLarga: string;
  ingredientes: string;
  informacionNutricional: NutrienteInfo[];
  imagen: string;
  galeria: string[];
  destacado?: boolean;
  nuevo?: boolean;
}

export interface CartItem {
  product: Product;
  cantidad: number;
  variante?: Variante;
}

export interface TimeSlot {
  hora: string;
  disponible: boolean;
}
