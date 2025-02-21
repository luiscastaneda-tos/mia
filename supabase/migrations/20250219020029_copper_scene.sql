/*
  # Fix Admin Function and Policies

  1. Changes
    - Create proper is_admin() function
    - Update policies to use email-based admin check
    - Ensure proper cascade behavior

  2. Security
    - Maintain RLS
    - Use email-based admin authentication
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT email = 'mianoktos@gmail.com'
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies for bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;

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

-- Recreate policies for payments
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Users can create own payments" ON payments;
DROP POLICY IF EXISTS "Users can update own payments" ON payments;

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

-- Recreate policies for invoices
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can create own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;

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