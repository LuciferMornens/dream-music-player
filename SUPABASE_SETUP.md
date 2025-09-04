# Supabase Setup Guide for Dream Music Player

This guide will help you set up Supabase for the Dream Music Player, transforming it from a local file-based system to a cloud-based multi-user platform.

## Prerequisites

1. A [Supabase](https://supabase.com) account
2. Node.js 18+ installed
3. The Dream Music Player codebase

## Step 1: Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - Name: `dream-music-player` (or any name you prefer)
   - Database Password: Generate a secure password (save this!)
   - Region: Choose the region closest to your users
5. Click "Create new project"
6. Wait for the project to be set up (2-3 minutes)

## Step 2: Configure Environment Variables

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - Project URL (under "Project URL")
   - Anon public key (under "Project API keys")

3. Create a `.env.local` file in your project root:
```bash
cp .env.local.example .env.local
```

4. Fill in the values in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query" and paste the following SQL:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create tracks table
CREATE TABLE public.tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL, 
  duration INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  genre TEXT DEFAULT 'Uncategorized',
  cover_art TEXT DEFAULT '/images/dw.png'
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on tracks  
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for tracks
CREATE POLICY "Users can view own tracks" ON public.tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracks" ON public.tracks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracks" ON public.tracks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracks" ON public.tracks
  FOR DELETE USING (auth.uid() = user_id);

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

3. Click "Run" to execute the SQL

## Step 4: Set Up Storage

1. Go to **Storage** in your Supabase dashboard
2. Click "Create a new bucket"
3. Fill in the details:
   - Name: `audio-files`
   - Public bucket: ✅ **checked** (so audio files can be accessed directly)
   - File size limit: 50MB (or your preferred limit)
   - MIME types: `audio/*` (to restrict to audio files only)
4. Click "Create bucket"

### Configure Storage RLS Policies

1. In the Storage section, click on the `audio-files` bucket
2. Go to **Policies** tab
3. Click "New policy" and create the following policies:

**Policy 1: Users can upload their own files**
- Policy name: `Users can upload own files`
- Allowed operation: INSERT
- Policy definition:
```sql
(bucket_id = 'audio-files'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 2: Users can view their own files**  
- Policy name: `Users can view own files`
- Allowed operation: SELECT
- Policy definition:
```sql
(bucket_id = 'audio-files'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 3: Users can delete their own files**
- Policy name: `Users can delete own files`  
- Allowed operation: DELETE
- Policy definition:
```sql
(bucket_id = 'audio-files'::text) AND (auth.uid()::text = (storage.foldername(name))[1])
```

**Policy 4: Public access for authenticated users**
- Policy name: `Public access for authenticated users`
- Allowed operation: SELECT
- Policy definition:
```sql
(bucket_id = 'audio-files'::text) AND (auth.role() = 'authenticated'::text)
```

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure your auth settings:
   - **Site URL**: Add your local development URL (e.g., `http://localhost:3000`)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback` for local development
3. Under **Email Auth**, make sure:
   - "Enable email confirmations" is enabled
   - "Enable email change confirmations" is enabled  
4. Save changes

## Step 6: Install Dependencies and Run

1. Install the new dependencies:
```bash
npm install --legacy-peer-deps
```

2. Start the development server:
```bash
npm run dev
```

3. Visit `http://localhost:3000` - you should be redirected to the login page

## Step 7: Test the Application

1. **Registration**: Go to `/auth/signup` and create a new account
2. **Email Confirmation**: Check your email and confirm your account
3. **Login**: Sign in with your credentials
4. **Upload**: Try uploading an audio file
5. **Playback**: Test playing the uploaded track
6. **Profile**: Check if your user profile appears in the navbar

## Troubleshooting

### Common Issues:

1. **Environment Variables**: Make sure `.env.local` exists and has correct values
2. **RLS Policies**: Ensure all RLS policies are created correctly
3. **Storage Bucket**: Verify the bucket name is exactly `audio-files`
4. **Email Confirmation**: Check spam folder for confirmation emails

### Checking Logs:
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Look for failed API requests
- **Supabase Dashboard**: Check database and storage logs

## Production Deployment

When deploying to production:

1. **Environment Variables**: Add your Supabase credentials to your hosting platform
2. **Site URL**: Update the Site URL in Supabase Auth settings
3. **Redirect URLs**: Add your production domain to redirect URLs
4. **Storage**: Consider CDN setup for better audio file delivery

## Security Considerations

- Row Level Security (RLS) is enabled to ensure users can only access their own data
- File uploads are restricted by user ID in the storage policies
- Authentication is required for all main features
- File size and type restrictions are enforced

## Features Enabled

✅ **Multi-user authentication**  
✅ **User-specific music libraries**  
✅ **Cloud file storage**  
✅ **Real-time updates**  
✅ **Secure file access**  
✅ **Responsive design**  
✅ **Data persistence**  

Your Dream Music Player is now a full-featured, cloud-based, multi-user platform! 🎵