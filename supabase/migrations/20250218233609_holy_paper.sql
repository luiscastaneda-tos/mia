/*
  # Fix Bookings Table Relationship

  1. Changes
    - Drop existing bookings table
    - Recreate bookings table with proper foreign key relationship to auth.users
    - Add necessary indexes
    - Set up RLS policies

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- First drop existing table if it exists
DROP TABLE IF EXISTS bookings CASCADE;

-- Recreate bookings table with proper relationship
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  hotel_name text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  room_type text NOT NULL,
  total_price numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX bookings_user_id_idx ON bookings(user_id);
CREATE INDEX bookings_confirmation_code_idx ON bookings(confirmation_code);
CREATE INDEX bookings_created_at_idx ON bookings(created_at);
CREATE INDEX bookings_status_idx ON bookings(status);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();