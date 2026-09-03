/*
# Add descuento column to orders

## Purpose
Store the discount amount applied to an order so the confirmation page
and accounting reflect the correct totals.

## Changes
- `orders` table: new column `descuento` (numeric, default 0).
*/

ALTER TABLE orders ADD COLUMN IF NOT EXISTS descuento numeric NOT NULL DEFAULT 0;
