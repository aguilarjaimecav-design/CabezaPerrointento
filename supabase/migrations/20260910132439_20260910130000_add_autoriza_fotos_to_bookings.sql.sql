/*
# Añadir columna autoriza_fotos a la tabla bookings

1. Tabla modificada
   - `bookings`
     - Nueva columna `autoriza_fotos` (boolean, no nulo, por defecto false)
     - Guarda si el cliente autoriza a CabezaPerro a publicar fotos de su perro
       en redes sociales y canales de comunicación.
     - Es opcional: el valor por defecto es false y no impide realizar la reserva.

2. Seguridad
   - No se modifican las políticas RLS existentes.
   - La columna es escribible por el mismo INSERT anónimo ya permitido.

3. Notas
   - Esta columna se llena desde el formulario de reserva cuando el usuario
     marca (o no) la casilla de autorización.
*/

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS autoriza_fotos boolean NOT NULL DEFAULT false;
