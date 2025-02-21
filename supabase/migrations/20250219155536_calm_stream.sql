-- Drop existing policies
DROP POLICY IF EXISTS "bookings_select_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_insert_policy" ON bookings;
DROP POLICY IF EXISTS "bookings_update_policy" ON bookings;
DROP POLICY IF EXISTS "payments_select_policy" ON payments;
DROP POLICY IF EXISTS "payments_insert_policy" ON payments;
DROP POLICY IF EXISTS "payments_update_policy" ON payments;
DROP POLICY IF EXISTS "invoices_select_policy" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_policy" ON invoices;
DROP POLICY IF EXISTS "invoices_update_policy" ON invoices;

-- Create simplified policies for bookings
CREATE POLICY "bookings_policy"
ON bookings
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create simplified policies for payments
CREATE POLICY "payments_policy"
ON payments
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create simplified policies for invoices
CREATE POLICY "invoices_policy"
ON invoices
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to get user's bookings
CREATE OR REPLACE FUNCTION get_user_bookings(user_uuid uuid)
RETURNS SETOF bookings
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM bookings
  WHERE user_id = user_uuid;
$$;

-- Create function to get user's payments
CREATE OR REPLACE FUNCTION get_user_payments(user_uuid uuid)
RETURNS SETOF payments
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM payments
  WHERE user_id = user_uuid;
$$;

-- Create function to get user's invoices
CREATE OR REPLACE FUNCTION get_user_invoices(user_uuid uuid)
RETURNS SETOF invoices
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM invoices
  WHERE user_id = user_uuid;
$$;