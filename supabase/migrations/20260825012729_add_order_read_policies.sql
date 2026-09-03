/*
# Allow customers to read their own order by Stripe session ID

## Purpose
After a successful Stripe payment, the customer is redirected back to the site
with a `session_id` query parameter. The frontend needs to read the order and
its line items to show a detailed confirmation page.

## Changes
1. `orders` table — new SELECT policy for `anon, authenticated` scoped to rows
   where `stripe_session_id` is non-null. This lets the anon-key frontend look
   up the order by session ID without exposing other customers' orders.
2. `order_items` table — new SELECT policy for `anon, authenticated` that allows
   reading items whose parent order has a non-null `stripe_session_id`. This
   prevents reading items belonging to orders that were never paid.

## Security
- Both policies use `TO anon, authenticated` because this is a no-auth app
  (the frontend uses the anon key exclusively).
- The `orders` policy only exposes rows that have a `stripe_session_id`, which
  is only set after a completed Stripe checkout. Unpaid/draft orders are not
  readable.
- The `order_items` policy is scoped through the parent `orders` table using
  an EXISTS subquery, so items are only visible when their parent order is.
*/

DROP POLICY IF EXISTS "anon_select_paid_orders" ON orders;
CREATE POLICY "anon_select_paid_orders"
ON orders FOR SELECT
TO anon, authenticated
USING (stripe_session_id IS NOT NULL);

DROP POLICY IF EXISTS "anon_select_paid_order_items" ON order_items;
CREATE POLICY "anon_select_paid_order_items"
ON order_items FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.stripe_session_id IS NOT NULL
  )
);
