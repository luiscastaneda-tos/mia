/*
  # Fix Admin Authentication Policies

  1. Changes
    - Replace string 'admin' check with proper role-based check
    - Update policies for all tables to use role-based admin access
    - Add admin role check function

  2. Security
    - Maintain RLS
    - Use proper role-based authentication
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Only admin can modify hotels" ON hotels;
DROP POLICY IF EXISTS "Admin can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Admin can modify all bookings" ON bookings;

-- Create new policies for hotels
CREATE POLICY "Admin can modify hotels"
  ON hotels
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Update bookings policies
CREATE POLICY "Admin can manage all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- Update payments policies
CREATE POLICY "Admin can manage all payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());

-- Update invoices policies
CREATE POLICY "Admin can manage all invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR is_admin())
  WITH CHECK (auth.uid() = user_id OR is_admin());