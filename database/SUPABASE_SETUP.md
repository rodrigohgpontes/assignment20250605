# Supabase Setup Guide

This guide will help you set up Supabase for the Localization Management project.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account or log in
3. Click "New Project"
4. Fill in the project details:
   - **Name**: `localization-management` (or your preferred name)
   - **Database Password**: Choose a strong password and save it
   - **Region**: Choose the region closest to you
5. Click "Create new project"
6. Wait for the project to be ready (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon public key** (starts with `eyJ`)
   - **Service role key** (starts with `eyJ`) - Keep this secret!

## Step 3: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `database/schema.sql`
4. Click "Run" to execute the schema
5. Verify the tables were created by going to **Table Editor**

You should see:
- `translation_keys` table with sample data
- `translations` table with English and Spanish translations

## Step 4: Configure Environment Variables

### Backend Configuration
1. Copy `api/environment.template` to `api/.env`
2. Fill in your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Frontend Configuration
1. Copy `front/environment.template` to `front/.env.local`
2. Fill in your configuration:
   ```
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Step 5: Test the Connection

### Test Backend Connection
```bash
cd api
python -c "
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()
url = os.getenv('SUPABASE_URL')
key = os.getenv('SUPABASE_ANON_KEY')
supabase = create_client(url, key)
result = supabase.table('translation_keys').select('*').limit(1).execute()
print('Connection successful:', len(result.data) > 0)
"
```

### Test Frontend Connection
The frontend connection will be tested when you run the Next.js development server and the React Query hooks attempt to fetch data.

## Step 6: Verify Sample Data

In the Supabase Table Editor, you should see:

### translation_keys table:
- 12 rows with keys like `button.save`, `nav.home`, etc.
- Categories: `buttons`, `navigation`, `messages`, `forms`

### translations table:
- 24 rows (12 keys × 2 languages)
- English (`en`) and Spanish (`es`) translations
- All translations attributed to `system` user

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Double-check your anon key and URL
2. **"Schema not found"**: Make sure you ran the schema.sql file
3. **"No data returned"**: Verify the sample data was inserted correctly
4. **CORS errors**: Ensure your frontend URL is in the allowed origins

### Verify Your Setup:
```sql
-- Run this in Supabase SQL Editor to verify everything is working
SELECT 
  tk.key,
  tk.category,
  COUNT(t.id) as translation_count
FROM translation_keys tk
LEFT JOIN translations t ON tk.id = t.translation_key_id
GROUP BY tk.id, tk.key, tk.category
ORDER BY tk.category, tk.key;
```

You should see each translation key with 2 translations.

## Security Notes

- Never commit your `.env` files to version control
- Keep your service role key secret - only use it in backend code
- Use the anon key for frontend/public access
- The anon key is safe to expose in frontend code

## Next Steps

Once Supabase is configured:
1. Test the backend API endpoints
2. Start the frontend development server
3. Verify that translation data loads correctly
4. Begin implementing the React components 