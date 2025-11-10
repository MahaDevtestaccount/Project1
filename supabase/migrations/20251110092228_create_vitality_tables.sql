/*
  # Vitality Vault Database Schema

  ## Overview
  Creates the core tables for the Vitality Vault application - a health and wellness tracking platform.

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `vitality_entries`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `date` (date)
  - `energy_level` (integer, 1-10 scale)
  - `mood` (integer, 1-10 scale)
  - `sleep_hours` (numeric)
  - `water_intake` (integer, glasses)
  - `exercise_minutes` (integer)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### `goals`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `target_value` (numeric)
  - `current_value` (numeric)
  - `category` (text)
  - `is_completed` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create vitality_entries table
CREATE TABLE IF NOT EXISTS vitality_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  mood integer CHECK (mood >= 1 AND mood <= 10),
  sleep_hours numeric CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  water_intake integer DEFAULT 0,
  exercise_minutes integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE vitality_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON vitality_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON vitality_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON vitality_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON vitality_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  target_value numeric,
  current_value numeric DEFAULT 0,
  category text NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vitality_entries_user_date ON vitality_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_category ON goals(user_id, category);
