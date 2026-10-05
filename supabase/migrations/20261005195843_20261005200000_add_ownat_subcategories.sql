/*
# Add OWNAT product range subcategories

1. Modified Tables
- `products.subcategoria` (text, nullable) stores the product range for OWNAT products.
- Existing products from other brands remain unchanged and keep this field null.

2. Data Classification
- OWNAT products are classified from their product titles into: Clásico, Ultra, Just, Prime, Care, and Author.
- Matching is case-insensitive and preserves the existing product IDs, prices, descriptions, images, and variants.

3. Security
- No new table or policy is created.
- Existing `products` RLS policies remain unchanged.

4. Important Notes
- The column is nullable so products from other brands do not receive an invented range.
- This migration is idempotent and does not delete or alter existing product information beyond adding the classification.
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategoria text;

UPDATE products
SET subcategoria = CASE
  WHEN nombre ILIKE '%OWNAT% CLÁSICO %' OR nombre ILIKE '%OWNAT% CLASICO %' THEN 'Clásico'
  WHEN nombre ILIKE '%OWNAT% ULTRA %' THEN 'Ultra'
  WHEN nombre ILIKE '%OWNAT% JUST %' THEN 'Just'
  WHEN nombre ILIKE '%OWNAT% PRIME %' THEN 'Prime'
  WHEN nombre ILIKE '%OWNAT% CARE %' THEN 'Care'
  WHEN nombre ILIKE '%OWNAT% AUTHOR %' THEN 'Author'
  ELSE subcategoria
END
WHERE marca = 'Ownat';

CREATE INDEX IF NOT EXISTS idx_products_subcategoria ON products(subcategoria);