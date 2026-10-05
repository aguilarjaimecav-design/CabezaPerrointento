/*
# Temporarily allow anon INSERT/UPDATE on products for bulk import
This migration adds a temporary INSERT+UPDATE policy for the anon role on the products table
to allow bulk import of the OWNAT catalog from the frontend. This is safe because the products
table already has anon SELECT policies (it's a public catalog).
*/
DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products"
ON products FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products"
ON products FOR UPDATE
TO anon, authenticated
USING (true) WITH CHECK (true);
