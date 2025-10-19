# 🗄️ Supabase Database Setup Guide

## Overview
Your app is now configured to work **with or without** a profiles table, but setting up the full database will unlock all features.

---

## ⚡ Quick Start (Minimum Setup)

### Step 1: Disable Email Confirmation
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Settings**
4. **DISABLE** "Enable email confirmations"
5. Click **Save**

✅ **This allows instant login without email verification**

---

## 🚀 Full Database Setup (Recommended)

### Step 2: Create Profiles Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Create Projects Table

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  primary_image_url TEXT,
  generated_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can read their own projects
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own projects
CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

### Step 4: Create Templates Table

```sql
-- Create templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Anyone can read public templates
CREATE POLICY "Anyone can read public templates"
  ON templates
  FOR SELECT
  USING (is_public = TRUE);

-- Create index
CREATE INDEX idx_templates_public ON templates(is_public);
```

---

## 🔧 For Existing Users

If you already have a user account (like shubhankarraj85@gmail.com), manually create a profile:

```sql
-- Replace YOUR_USER_ID with your actual user ID from auth.users
INSERT INTO profiles (id, first_name, last_name)
VALUES (
  'YOUR_USER_ID',
  'Your First Name',
  'Your Last Name'
);
```

To find your user ID:
```sql
SELECT id, email FROM auth.users;
```

---

## 🎯 Testing the Setup

### Test 1: Login
1. Go to http://localhost:3000/auth/login
2. Enter: shubhankarraj85@gmail.com
3. Enter your password
4. Click "Sign In"
5. ✅ You should redirect to `/dashboard`

### Test 2: Profile Display
1. After login, check the dashboard
2. You should see your name (or email) in the welcome message
3. ✅ No more "Error fetching profile" errors

### Test 3: Create Project
1. Click "New Project" on dashboard
2. You should navigate to `/editor`
3. ✅ Editor should load successfully

---

## 🐛 Troubleshooting

### Problem: Still getting "Error fetching profile"
**Solution:** The app now works WITHOUT profiles! This is just a log message. The app will use your email instead.

### Problem: "User not found" after login
**Solution:** 
1. Check Supabase Auth dashboard
2. Make sure "Enable email confirmations" is **DISABLED**
3. Try signing up again

### Problem: Can't access dashboard
**Solution:**
1. Clear browser cache and cookies
2. Sign out completely
3. Sign in again
4. Check browser console for errors

### Problem: "relation 'profiles' does not exist"
**Solution:** This is now handled gracefully! But if you want full features, run the SQL from Step 2 above.

---

## 📊 What Works Now vs. After Full Setup

### ✅ Works NOW (Without Database Setup)
- ✅ User signup and login
- ✅ Authentication and session management
- ✅ Redirects to dashboard/editor
- ✅ Protected routes
- ✅ Email displayed in UI

### 🚀 Works AFTER Full Setup
- 🚀 User profiles with names
- 🚀 Save and load projects
- 🚀 Project history and management
- 🚀 Templates library
- 🚀 Avatar uploads

---

## 🎉 Summary

Your authentication is **FIXED** and working! The app will:

1. ✅ Let users sign up and login
2. ✅ Redirect to dashboard after login
3. ✅ Work even without profiles table
4. ✅ Show email if no profile exists
5. ✅ Let users access the editor

To unlock ALL features, run the SQL scripts above in your Supabase dashboard!
