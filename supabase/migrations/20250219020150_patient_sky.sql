/*
  # Fix Bookings User Relationship

  1. Changes
    - Drop existing tables to ensure clean slate
    - Recreate tables with proper relationships
    - Update policies to use direct user checks
    - Add proper indexes and constraints

  2. Security
    - Maintain RLS
    - Use proper foreign key relationships
    - Ensure cascading deletes
*/

-- Drop dependent tables first
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- Recreate bookings table with proper relationship
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code text UNIQUE NOT NULL,
  user_id uuid NOT NULL,
  hotel_name text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  room_type text NOT NULL,
  total_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Recreate payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  booking_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'mxn',
  status text NOT NULL DEFAULT 'pending',
  payment_intent_id text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_booking
    FOREIGN KEY(booking_id) 
    REFERENCES bookings(id)
    ON DELETE CASCADE
);

-- Recreate invoices table
CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  booking_id uuid NOT NULL,
  invoice_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  amount numeric NOT NULL,
  tax_percentage numeric NOT NULL DEFAULT 16,
  billing_details jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_user
    FOREIGN KEY(user_id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_booking
    FOREIGN KEY(booking_id) 
    REFERENCES bookings(id)
    ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX bookings_user_id_idx ON bookings(user_id);
CREATE INDEX bookings_confirmation_code_idx ON bookings(confirmation_code);
CREATE INDEX bookings_created_at_idx ON bookings(created_at);
CREATE INDEX bookings_status_idx ON bookings(status);

CREATE INDEX payments_user_id_idx ON payments(user_id);
CREATE INDEX payments_booking_id_idx ON payments(booking_id);
CREATE INDEX payments_created_at_idx ON payments(created_at);

CREATE INDEX invoices_user_id_idx ON invoices(user_id);
CREATE INDEX invoices_booking_id_idx ON invoices(booking_id);
CREATE INDEX invoices_created_at_idx ON invoices(created_at);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
CREATE POLICY "bookings_select_policy"
ON bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "bookings_insert_policy"
ON bookings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "bookings_update_policy"
ON bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()))
WITH CHECK (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()));

-- Create policies for payments
CREATE POLICY "payments_select_policy"
ON payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "payments_insert_policy"
ON payments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "payments_update_policy"
ON payments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()))
WITH CHECK (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()));

-- Create policies for invoices
CREATE POLICY "invoices_select_policy"
ON invoices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "invoices_insert_policy"
ON invoices
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "invoices_update_policy"
ON invoices
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()))
WITH CHECK (auth.uid() = user_id OR (SELECT email = 'mianoktos@gmail.com' FROM auth.users WHERE id = auth.uid()));