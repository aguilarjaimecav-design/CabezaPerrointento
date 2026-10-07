/*
# Create Redsys order sequence and next_redsys_order() function

## Purpose
Replace the UUID-derived Ds_Merchant_Order generation with a sequential counter
to eliminate collision risk. The Redsys order number must be exactly 12 numeric
digits starting with "3729" (4-digit merchant prefix + 8-digit sequential suffix).

## Changes

1. New sequence `redsys_order_seq`
   - Starts at 1, increments by 1.
   - Provides a monotonically increasing counter for Redsys order numbers.
   - Capacity: up to 99,999,999 orders before exhausting the 8-digit suffix.

2. New function `next_redsys_order()`
   - SECURITY DEFINER, returns text.
   - Calls nextval('redsys_order_seq') and formats as "3729" + 8-digit zero-padded suffix.
   - Example: sequence value 42 -> "3729000000042"
   - Granted EXECUTE to anon and authenticated so the edge function can call it
     via the PostgREST RPC endpoint with the service role key.

## Security
- The function is SECURITY DEFINER so callers don't need direct access to the sequence.
- EXECUTE granted to anon and authenticated (the edge function uses the service role key
  which bypasses RLS, but granting to anon/authenticated ensures compatibility).
- No tables are created or modified.
- No RLS changes (sequences don't have RLS).
*/

CREATE SEQUENCE IF NOT EXISTS redsys_order_seq
  START 1
  INCREMENT 1
  NO CYCLE;

CREATE OR REPLACE FUNCTION next_redsys_order()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  seq_val bigint;
BEGIN
  seq_val := nextval('redsys_order_seq');
  RETURN '3729' || lpad(seq_val::text, 8, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION next_redsys_order() TO anon, authenticated;
GRANT USAGE ON SEQUENCE redsys_order_seq TO anon, authenticated;
