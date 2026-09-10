/*
# Add ticket PDF storage columns and bucket

1. Modified Tables
- `orders`: adds `ticket_pdf_path` (text, nullable) — path in Supabase Storage where the product ticket PDF is stored.
- `bookings`: adds `ticket_pdf_path` (text, nullable) — path in Supabase Storage where the booking ticket PDF is stored.

2. Storage
- Creates a private bucket `tickets` for storing generated PDF tickets.
- Sets public read to false (downloads are mediated by an edge function that validates access).

3. Security
- No RLS policy changes on existing tables.
- The `tickets` bucket is private; access is controlled via the download-ticket edge function using the service role key.
- Existing SELECT policies on `orders` already allow the anon key to read order data (used by the payment success page).

4. Important Notes
- Both columns are nullable so existing rows are unaffected.
- The edge functions populate these columns after generating and uploading the PDF.
- The frontend reads `ticket_pdf_path` from the order/booking row to offer a download button.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'ticket_pdf_path') THEN
    ALTER TABLE orders ADD COLUMN ticket_pdf_path text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'ticket_pdf_path') THEN
    ALTER TABLE bookings ADD COLUMN ticket_pdf_path text;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tickets', 'tickets', false)
ON CONFLICT (id) DO NOTHING;
