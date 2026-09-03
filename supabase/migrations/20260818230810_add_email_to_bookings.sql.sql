/*
# Añadir columna email a bookings

1. Cambios
- Añade la columna `email` (text, opcional con valor por defecto '') a la tabla `bookings`
  para poder guardar el correo electrónico del cliente que reserva y enviarle
  un correo de confirmación de reserva.

2. Seguridad
- No se modifican las políticas RLS existentes. La tabla sigue con INSERT-only para anon/authenticated.
- La nueva columna es accesible bajo las mismas reglas que el resto de la fila.

3. Notas
- Se usa `IF NOT EXISTS` para que la migración sea idempotente y segura de reejecutar.
- No se eliminan ni renombran columnas existentes; no hay pérdida de datos.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'email'
  ) THEN
    ALTER TABLE bookings ADD COLUMN email text NOT NULL DEFAULT '';
  END IF;
END $$;
