/*
  # Add image_url to bookings table

  1. Changes
    - Add image_url column to bookings table
    - Add index for image_url column for better performance
*/

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE bookings 
    ADD COLUMN image_url text;
  END IF;
END $$;

-- Create index for image_url if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE tablename = 'bookings'
    AND indexname = 'bookings_image_url_idx'
  ) THEN
    CREATE INDEX bookings_image_url_idx ON bookings(image_url);
  END IF;
END $$;