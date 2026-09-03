/*
# Añadir columna duracion a reservas de paseos

1. Tabla modificada
  - `bookings`
    - `duracion` (text, opcional) — duración del paseo elegida por el cliente: "30 min" o "60 min".

2. Seguridad
  - No se modifican políticas ni RLS. La nueva columna hereda las restricciones existentes.

3. Notas
  - La columna es opcional (nullable) para no romper reservas existentes.
*/

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS duracion text;