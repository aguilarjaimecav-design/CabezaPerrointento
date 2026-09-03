import { supabase } from '@/lib/supabase';
import { Categoria, NutrienteInfo, Product } from '@/types';

export const CATEGORIAS: { slug: Categoria; nombre: string; especie: 'perro' | 'gato' }[] = [
  { slug: 'pienso-perros', nombre: 'Pienso para perros', especie: 'perro' },
  { slug: 'pienso-gatos', nombre: 'Pienso para gatos', especie: 'gato' },
  { slug: 'humeda-perros', nombre: 'Comida húmeda para perros', especie: 'perro' },
  { slug: 'humeda-gatos', nombre: 'Comida húmeda para gatos', especie: 'gato' },
  { slug: 'Complementos', nombre: 'Complementos', especie: 'gato' },
];

interface ProductRow {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
  especie: string;
  formato: string;
  precio: number;
  precio_anterior: number | null;
  valoracion: number;
  num_valoraciones: number;
  descripcion_breve: string;
  descripcion_larga: string;
  ingredientes: string;
  informacion_nutricional: NutrienteInfo[];
  imagen: string;
  galeria: string[];
  destacado: boolean;
  nuevo: boolean;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    nombre: row.nombre,
    marca: row.marca,
    categoria: row.categoria as Categoria,
    especie: row.especie as 'perro' | 'gato',
    formato: row.formato,
    precio: Number(row.precio),
    precioAnterior: row.precio_anterior ? Number(row.precio_anterior) : undefined,
    valoracion: Number(row.valoracion),
    numValoraciones: row.num_valoraciones,
    descripcionBreve: row.descripcion_breve,
    descripcionLarga: row.descripcion_larga,
    ingredientes: row.ingredientes,
    informacionNutricional: Array.isArray(row.informacion_nutricional) ? row.informacion_nutricional : [],
    imagen: row.imagen,
    galeria: Array.isArray(row.galeria) ? row.galeria : [row.imagen],
    destacado: row.destacado,
    nuevo: row.nuevo,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('orden', { ascending: true });

  if (error || !data) return [];
  return (data as ProductRow[]).map(rowToProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToProduct(data as ProductRow);
}

export async function fetchRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .neq('id', product.id)
    .or(`categoria.eq.${product.categoria},especie.eq.${product.especie}`)
    .order('orden', { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return (data as ProductRow[]).map(rowToProduct);
}

export async function fetchFeaturedProducts(limit = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('destacado', true)
    .order('orden', { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return (data as ProductRow[]).map(rowToProduct);
}

export function categoriaNombre(categoria: Categoria): string {
  return CATEGORIAS.find((c) => c.slug === categoria)?.nombre ?? categoria;
}
