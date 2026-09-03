/*
# Create coupons table for discount codes

## Purpose
Allow the shop owner to create promotional discount codes that customers
can apply at checkout for a percentage or fixed-amount discount.

## New Table
- `coupons`
  - `id` (uuid, primary key)
  - `codigo` (text, unique, uppercase) — the code customers type
  - `tipo` (text: 'porcentaje' | 'fijo') — percentage vs fixed amount
  - `valor` (numeric) — percentage (e.g. 10 = 10%) or euros (e.g. 5 = 5€)
  - `activo` (boolean, default true) — can be deactivated without deleting
  - `fecha_inicio` (timestamptz) — when the coupon becomes valid
  - `fecha_fin` (timestamptz, nullable) — when it expires (null = no expiry)
  - `usos_maximos` (int, nullable) — max total uses (null = unlimited)
  - `usos` (int, default 0) — current usage count
  - `created_at` (timestamptz, default now())

## Security
- RLS enabled.
- SELECT for `anon, authenticated` so the frontend can validate a code.
- All other operations (INSERT/UPDATE/DELETE) are denied to anon/authenticated
  — the owner manages coupons via the Supabase dashboard or service role.
*/

CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  tipo text NOT NULL DEFAULT 'porcentaje' CHECK (tipo IN ('porcentaje', 'fijo')),
  valor numeric NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  fecha_inicio timestamptz NOT NULL DEFAULT now(),
  fecha_fin timestamptz,
  usos_maximos int,
  usos int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_active_coupons" ON coupons;
CREATE POLICY "anon_select_active_coupons"
ON coupons FOR SELECT
TO anon, authenticated
USING (activo = true);
