/*
  # Create search history table

  1. New Tables
    - `search_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `query` (text, the search query)
      - `results` (jsonb, search results data)
      - `results_count` (integer, number of results found)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `search_history` table
    - Add policy for users to read their own search history
    - Add policy for users to insert their own search history
    - Add policy for users to delete their own search history

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on created_at for chronological sorting
*/

-- Create search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query text NOT NULL,
  results jsonb DEFAULT '[]'::jsonb,
  results_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Create policies for search_history
CREATE POLICY "Users can read own search history"
  ON search_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
  ON search_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own search history"
  ON search_history
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_history_user_id 
  ON search_history(user_id);

CREATE INDEX IF NOT EXISTS idx_search_history_created_at 
  ON search_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_search_history_user_created 
  ON search_history(user_id, created_at DESC);