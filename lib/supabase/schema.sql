-- Schema for image editing sessions and results
-- This file documents the required Supabase tables

-- Create image_sessions table to store editing sessions
CREATE TABLE IF NOT EXISTS image_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Original image data
  original_image_url TEXT NOT NULL,
  original_image_name VARCHAR(255),
  
  -- Generated image data
  generated_image_url TEXT,
  generated_image_name VARCHAR(255),
  
  -- Reference images (stored as JSON array)
  reference_images JSONB DEFAULT '[]'::jsonb,
  
  -- AI prompt and settings
  prompt TEXT,
  aspect_ratio VARCHAR(50),
  
  -- Adjustments (stored as JSON)
  adjustments JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Version tracking
  version INTEGER DEFAULT 1,
  parent_session_id UUID REFERENCES image_sessions(id) ON DELETE SET NULL,
  
  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(255) UNIQUE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_image_sessions_user_id ON image_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_image_sessions_created_at ON image_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_sessions_share_token ON image_sessions(share_token);
CREATE INDEX IF NOT EXISTS idx_image_sessions_parent ON image_sessions(parent_session_id);

-- Create image_versions table to track all versions of an image
CREATE TABLE IF NOT EXISTS image_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES image_sessions(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  adjustments JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(session_id, version_number)
);

-- Create index for versions
CREATE INDEX IF NOT EXISTS idx_image_versions_session_id ON image_versions(session_id);

-- Row Level Security (RLS) policies
ALTER TABLE image_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_versions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON image_sessions
  FOR SELECT USING (auth.uid() = user_id OR is_public = TRUE);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON image_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON image_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON image_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Versions policies
CREATE POLICY "Users can view versions of their sessions" ON image_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM image_sessions 
      WHERE id = image_versions.session_id 
      AND (user_id = auth.uid() OR is_public = TRUE)
    )
  );

CREATE POLICY "Users can insert versions" ON image_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM image_sessions 
      WHERE id = image_versions.session_id 
      AND user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_image_sessions_updated_at 
  BEFORE UPDATE ON image_sessions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
