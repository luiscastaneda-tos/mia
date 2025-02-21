/*
  # Fix Admin Tables and Relationships

  1. Changes
    - Create hotels table for manual reservations
    - Add admin-specific policies
    - Fix relationship issues

  2. Security
    - Enable RLS
    - Add policies for both users and admin
*/

-- Create hotels table for manual reservations
CREATE TABLE IF NOT EXISTS hotels (
  id_interno SERIAL PRIMARY KEY,
  ID integer NOT NULL,
  "TIPO DE NEGOCIACION" text NOT NULL,
  MARCA text NOT NULL,
  ESTADO text NOT NULL,
  "CIUDAD / ZONA" text NOT NULL,
  "TARIFA HAB SENCILLA Q" numeric NOT NULL,
  "TARIFA HAB DOBLE QQ" numeric NOT NULL,
  "MENORES DE EDAD" text,
  Desayuno text,
  IMAGES text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for hotels
CREATE INDEX hotels_marca_idx ON hotels(MARCA);
CREATE INDEX hotels_estado_idx ON hotels(ESTADO);
CREATE INDEX hotels_ciudad_zona_idx ON hotels("CIUDAD / ZONA");

-- Enable RLS for hotels
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Create policies for hotels
CREATE POLICY "Everyone can view hotels"
  ON hotels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admin can modify hotels"
  ON hotels
  FOR ALL
  TO authenticated
  USING (auth.uid() = 'admin')
  WITH CHECK (auth.uid() = 'admin');

-- Update existing policies for admin access
CREATE POLICY "Admin can view all bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (
    CASE 
      WHEN auth.uid() = 'admin' THEN true
      ELSE auth.uid() = user_id
    END
  );

CREATE POLICY "Admin can modify all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN auth.uid() = 'admin' THEN true
      ELSE auth.uid() = user_id
    END
  )
  WITH CHECK (
    CASE 
      WHEN auth.uid() = 'admin' THEN true
      ELSE auth.uid() = user_id
    END
  );

-- Create trigger for hotels updated_at
CREATE TRIGGER update_hotels_updated_at
  BEFORE UPDATE ON hotels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();