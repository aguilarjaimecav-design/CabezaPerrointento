/*
# Formularios de contacto, reservas de paseos y pedidos

1. Nuevas tablas
  - `contact_messages` — mensajes enviados desde el formulario de contacto.
    - `id` (uuid, clave primaria)
    - `nombre` (texto)
    - `email` (texto)
    - `telefono` (texto)
    - `motivo` (texto) — motivo de contacto seleccionado
    - `mensaje` (texto)
    - `created_at` (fecha/hora de creación)
  - `bookings` — reservas del servicio de paseos para perros.
    - `id` (uuid, clave primaria)
    - `nombre_dueno` (texto)
    - `telefono` (texto)
    - `nombre_perro` (texto)
    - `raza` (texto)
    - `edad` (texto)
    - `fecha` (fecha de la reserva)
    - `hora` (texto, franja horaria elegida)
    - `observaciones` (texto, opcional)
    - `created_at` (fecha/hora de creación)
  - `orders` — pedidos realizados desde el checkout de la tienda.
    - `id` (uuid, clave primaria)
    - `nombre`, `apellidos`, `telefono`, `email` (datos personales)
    - `calle`, `numero`, `piso`, `codigo_postal` (dirección de entrega en Sevilla)
    - `metodo_pago` (texto: tarjeta, paypal o contra entrega)
    - `subtotal`, `envio`, `total` (numéricos)
    - `created_at` (fecha/hora de creación)
  - `order_items` — líneas de producto de cada pedido.
    - `id` (uuid, clave primaria)
    - `order_id` (referencia a `orders`)
    - `product_id` (texto, identificador del producto ficticio)
    - `product_name` (texto)
    - `cantidad` (entero)
    - `precio_unitario` (numérico)

2. Seguridad
  - RLS activado en las 4 tablas.
  - La web no tiene sistema de cuentas (no-auth), así que las políticas se aplican a los roles `anon` y `authenticated`.
  - Solo se permite INSERT desde el cliente (formularios públicos): nadie puede leer, modificar ni borrar estos datos a través de la clave pública, ya que contienen datos personales (teléfono, email, dirección). La consulta de estos datos se hará desde el panel de Supabase con la clave de servicio.

3. Notas importantes
  - No se crean políticas de SELECT/UPDATE/DELETE para anon/authenticated intencionadamente: los datos quedan protegidos frente a lectura pública.
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text NOT NULL DEFAULT '',
  motivo text NOT NULL,
  mensaje text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_messages" ON contact_messages;
CREATE POLICY "anon_insert_contact_messages" ON contact_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_dueno text NOT NULL,
  telefono text NOT NULL,
  nombre_perro text NOT NULL,
  raza text NOT NULL DEFAULT '',
  edad text NOT NULL DEFAULT '',
  fecha date NOT NULL,
  hora text NOT NULL,
  observaciones text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  apellidos text NOT NULL,
  telefono text NOT NULL,
  email text NOT NULL,
  calle text NOT NULL,
  numero text NOT NULL,
  piso text NOT NULL DEFAULT '',
  codigo_postal text NOT NULL,
  metodo_pago text NOT NULL,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  envio numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  cantidad integer NOT NULL DEFAULT 1,
  precio_unitario numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_bookings_fecha ON bookings(fecha);
