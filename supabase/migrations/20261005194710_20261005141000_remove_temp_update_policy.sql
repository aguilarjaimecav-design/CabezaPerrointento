/*
# Remove temporary anon UPDATE policy on products
*/
DROP POLICY IF EXISTS "anon_update_products" ON products;
