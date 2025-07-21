/*
  # Fix RLS policy for users table

  1. Security
    - Enable RLS on users table
    - Create policy to allow authenticated users to insert their own profile
    - Create policy to allow users to read their own data
    - Create policy to allow users to update their own data

  This fixes the "new row violates row-level security policy" error during sign-up.
*/

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Create policy to allow authenticated users to insert their own profile
CREATE POLICY "Allow authenticated users to insert own profile" 
  ON users 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- Create policy to allow users to read their own data
CREATE POLICY "Users can read own data" 
  ON users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update own data" 
  ON users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);