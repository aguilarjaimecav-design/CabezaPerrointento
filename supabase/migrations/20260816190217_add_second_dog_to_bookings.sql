/*
# Añadir campos del segundo perro a las reservas

1. Tablas modificadas
  - `bookings`:
    - `nombre_perro_2` (texto, opcional) — nombre del segundo perro.
    - `raza_2` (texto, opcional) — raza del segundo perro.
    - `edad_2` (texto, opcional) — edad del segundo perro.

2. Seguridad
  - Sin cambios en las políticas: las nuevas columnas se cubren con la política INSERT existente (anon + authenticated).
  - Las columnas son opcionales y por defecto quedan vacías.

3. Notas
  - No se modifican ni eliminan columnas existentes.
*/

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS nombre_perro_2 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS raza_2 text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS edad_2 text NOT NULL DEFAULT '';
