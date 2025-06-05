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

-- Sample data for development and testing
INSERT INTO translation_keys (key, category, description) VALUES
  ('button.save', 'buttons', 'Save button text'),
  ('button.cancel', 'buttons', 'Cancel button text'),
  ('button.delete', 'buttons', 'Delete button text'),
  ('button.edit', 'buttons', 'Edit button text'),
  ('nav.home', 'navigation', 'Home navigation link'),
  ('nav.about', 'navigation', 'About navigation link'),
  ('nav.contact', 'navigation', 'Contact navigation link'),
  ('message.welcome', 'messages', 'Welcome message for users'),
  ('message.goodbye', 'messages', 'Goodbye message for users'),
  ('form.email', 'forms', 'Email input label'),
  ('form.password', 'forms', 'Password input label'),
  ('form.confirm_password', 'forms', 'Confirm password input label')
ON CONFLICT (key) DO NOTHING;

-- Sample translations in English and Spanish
INSERT INTO translations (translation_key_id, language_code, value, updated_by) 
SELECT 
  tk.id,
  'en',
  CASE tk.key
    WHEN 'button.save' THEN 'Save'
    WHEN 'button.cancel' THEN 'Cancel'
    WHEN 'button.delete' THEN 'Delete'
    WHEN 'button.edit' THEN 'Edit'
    WHEN 'nav.home' THEN 'Home'
    WHEN 'nav.about' THEN 'About'
    WHEN 'nav.contact' THEN 'Contact'
    WHEN 'message.welcome' THEN 'Welcome!'
    WHEN 'message.goodbye' THEN 'Goodbye!'
    WHEN 'form.email' THEN 'Email'
    WHEN 'form.password' THEN 'Password'
    WHEN 'form.confirm_password' THEN 'Confirm Password'
  END,
  'system'
FROM translation_keys tk
ON CONFLICT (translation_key_id, language_code) DO NOTHING;

INSERT INTO translations (translation_key_id, language_code, value, updated_by) 
SELECT 
  tk.id,
  'es',
  CASE tk.key
    WHEN 'button.save' THEN 'Guardar'
    WHEN 'button.cancel' THEN 'Cancelar'
    WHEN 'button.delete' THEN 'Eliminar'
    WHEN 'button.edit' THEN 'Editar'
    WHEN 'nav.home' THEN 'Inicio'
    WHEN 'nav.about' THEN 'Acerca de'
    WHEN 'nav.contact' THEN 'Contacto'
    WHEN 'message.welcome' THEN '¡Bienvenido!'
    WHEN 'message.goodbye' THEN '¡Adiós!'
    WHEN 'form.email' THEN 'Correo'
    WHEN 'form.password' THEN 'Contraseña'
    WHEN 'form.confirm_password' THEN 'Confirmar Contraseña'
  END,
  'system'
FROM translation_keys tk
ON CONFLICT (translation_key_id, language_code) DO NOTHING; 