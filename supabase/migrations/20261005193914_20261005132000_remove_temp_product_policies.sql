/*
# Remove temporary anon INSERT/UPDATE policies on products
Removes the temporary policies added for bulk import. The products table
remains readable by anon (SELECT policy) but can no longer be written by anon.
*/
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
