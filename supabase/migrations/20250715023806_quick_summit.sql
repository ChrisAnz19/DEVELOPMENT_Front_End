/*
  # Fix RLS Policy for Users Table

  1. Security Updates
    - Drop existing restrictive INSERT policy
    - Create new policy allowing authenticated users to insert their own data
    - Ensure policy works with auth.uid() during sign-up process

  This fixes the "new row violates row-level security policy" error during user registration.
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own data" ON users;

-- Create a new INSERT policy that allows authenticated users to insert their own data
CREATE POLICY "Allow authenticated users to insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the SELECT and UPDATE policies are also correct
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);