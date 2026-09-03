/*
# Tabla de productos del catálogo

1. Nueva tabla
  - `products` — catálogo público de productos de la tienda.
    - `id` (text, clave primaria) — identificador legible del producto (slug).
    - `nombre` (text) — nombre del producto.
    - `marca` (text) — marca del producto.
    - `categoria` (text) — categoría: pienso-perros, pienso-gatos, humeda-perros, humeda-gatos.
    - `especie` (text) — perro o gato.
    - `formato` (text) — peso o formato (ej. "3 kg", "400 g").
    - `precio` (numeric) — precio en euros.
    - `precio_anterior` (numeric, opcional) — precio anterior para mostrar descuento.
    - `valoracion` (numeric) — valoración media (0-5).
    - `num_valoraciones` (integer) — número de valoraciones.
    - `descripcion_breve` (text) — descripción corta para tarjetas.
    - `descripcion_larga` (text) — descripción detallada para la página de producto.
    - `ingredientes` (text) — lista de ingredientes.
    - `informacion_nutricional` (jsonb) — array de pares etiqueta/valor (ej. [{"etiqueta":"Proteína","valor":"26%"}]).
    - `imagen` (text) — URL de la imagen principal.
    - `galeria` (jsonb) — array de URLs de imágenes para la galería.
    - `destacado` (boolean) — si el producto aparece como destacado en la home.
    - `nuevo` (boolean) — si el producto lleva la etiqueta de "nuevo".
    - `orden` (integer) — orden de visualización (los menores aparecen primero).
    - `created_at` (timestamptz) — fecha de creación.

2. Seguridad
  - RLS activado.
  - La web no tiene sistema de cuentas (no-auth). El catálogo es público: se permite SELECT a anon y authenticated.
  - No se permiten INSERT/UPDATE/DELETE desde el cliente. Los productos se gestionan desde el panel de Supabase con la clave de servicio.

3. Notas
  - `informacion_nutricional` y `galeria` se guardan como jsonb para preservar la estructura de array.
  - Se añade índice en `categoria` y `especie` para acelerar los filtros de la tienda.
*/

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  marca text NOT NULL,
  categoria text NOT NULL,
  especie text NOT NULL,
  formato text NOT NULL DEFAULT '',
  precio numeric(10,2) NOT NULL DEFAULT 0,
  precio_anterior numeric(10,2),
  valoracion numeric(2,1) NOT NULL DEFAULT 0,
  num_valoraciones integer NOT NULL DEFAULT 0,
  descripcion_breve text NOT NULL DEFAULT '',
  descripcion_larga text NOT NULL DEFAULT '',
  ingredientes text NOT NULL DEFAULT '',
  informacion_nutricional jsonb NOT NULL DEFAULT '[]'::jsonb,
  imagen text NOT NULL DEFAULT '',
  galeria jsonb NOT NULL DEFAULT '[]'::jsonb,
  destacado boolean NOT NULL DEFAULT false,
  nuevo boolean NOT NULL DEFAULT false,
  orden integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria);
CREATE INDEX IF NOT EXISTS idx_products_especie ON products(especie);
CREATE INDEX IF NOT EXISTS idx_products_destacado ON products(destacado);
