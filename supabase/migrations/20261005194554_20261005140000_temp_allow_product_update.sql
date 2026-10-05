/*
# Temporarily allow anon UPDATE on products for bulk name/rating update
*/
DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products"
ON products FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);
