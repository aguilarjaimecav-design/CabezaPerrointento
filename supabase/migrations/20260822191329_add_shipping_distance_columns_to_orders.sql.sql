/*
# Añadir columnas de localidad y distancia a pedidos

1. Tabla modificada
  - `orders`
    - `localidad` (text, opcional) — municipio/localidad del cliente, necesaria para calcular rutas.
    - `distancia_km` (numeric, opcional) — distancia por carretera desde el origen (Calle Lictores, 41018 Sevilla) hasta la dirección de entrega.

2. Seguridad
  - No se modifican políticas ni RLS. Las nuevas columnas heredan las restricciones existentes.
  - Solo INSERT está permitido desde el cliente; la lectura/escritura de estas columnas se hace desde las Edge Functions con la service role key.

3. Notas
  - Las columnas son opcionales (nullable) para no romper pedidos existentes.
  - No se eliminan ni renombran columnas existentes.
*/

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS localidad text,
  ADD COLUMN IF NOT EXISTS distancia_km numeric(6,2);