/*
# Add variantes column to products table

## What this does
Adds a `variantes` jsonb column to the `products` table to support products
with multiple formats/weights and their corresponding prices. Each element in
the array is { formato, precio, precioAnterior? }.

## Why
Many products (e.g. OWNAT) come in multiple bag sizes (1.5 kg, 4 kg, 15 kg)
each with a different price. Instead of creating separate product rows per
size, we store one product with a `variantes` array. The frontend shows a
format selector on the product page, and the cart stores the selected variant.

## Changes
1. New column: `products.variantes` (jsonb, NOT NULL, default '[]')
2. No RLS policy changes needed — the column is readable/writable via existing
   policies on `products`.

## Important notes
- The existing `formato` and `precio` columns remain as the "default" format
  and price (the first variant). This keeps backward compatibility with
  existing products that have a single format.
- When `variantes` is non-empty, the frontend uses it for the format selector.
  When empty, the product behaves as before (single format/price).
*/
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS variantes jsonb NOT NULL DEFAULT '[]'::jsonb;
