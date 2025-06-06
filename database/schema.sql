-- Localization Management Database Schema
-- This schema supports the translation key management system

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Translation Keys table
-- Stores the master list of translation keys with metadata
CREATE TABLE IF NOT EXISTS translation_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translations table
-- Stores the actual translations for each key and language
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation_key_id UUID REFERENCES translation_keys(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT NOT NULL,
  UNIQUE(translation_key_id, language_code)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_translation_keys_category ON translation_keys(category);
CREATE INDEX IF NOT EXISTS idx_translation_keys_key ON translation_keys(key);
CREATE INDEX IF NOT EXISTS idx_translations_language_code ON translations(language_code);
CREATE INDEX IF NOT EXISTS idx_translations_key_language ON translations(translation_key_id, language_code);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update timestamps
CREATE TRIGGER update_translation_keys_updated_at BEFORE UPDATE ON translation_keys 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 