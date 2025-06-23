-- Food data tables for cross-device sync
-- Run this in your Supabase SQL editor

-- Food entries table
CREATE TABLE IF NOT EXISTS food_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  foods_json JSONB NOT NULL,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorite foods table
CREATE TABLE IF NOT EXISTS favorite_foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  food_name TEXT NOT NULL,
  nutrition_json JSONB NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_food_entries_user_date ON food_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_food_entries_user_created ON food_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorite_foods_user_freq ON favorite_foods(user_id, frequency DESC);
CREATE INDEX IF NOT EXISTS idx_favorite_foods_user_name ON favorite_foods(user_id, food_name);

-- Row Level Security (RLS) policies
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_foods ENABLE ROW LEVEL SECURITY;

-- Policy for food_entries: users can only access their own data
CREATE POLICY "Users can manage their own food entries" ON food_entries
FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Policy for favorite_foods: users can only access their own data
CREATE POLICY "Users can manage their own favorite foods" ON favorite_foods
FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Update trigger for food_entries
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_food_entries_updated_at 
BEFORE UPDATE ON food_entries 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();