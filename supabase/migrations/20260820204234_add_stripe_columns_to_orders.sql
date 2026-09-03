-- Añade columnas para integración con Stripe Checkout
-- No se eliminan ni renombran columnas existentes

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent text,
  ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'pendiente';

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders(stripe_session_id);
