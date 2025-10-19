# Supabase Configuration Guide for TAP[IMAGINE]

## 🔧 Quick Fix for Authentication Issues

Your Supabase is configured at: **https://hxmojhummwuvfjtgzpzo.supabase.co**

### Step 1: Disable Email Confirmation (For Development)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **hxmojhummwuvfjtgzpzo**
3. Navigate to: **Authentication** → **Settings** (in left sidebar)
4. Scroll to **Email Auth** section
5. Find **"Enable email confirmations"**
6. **Turn it OFF** (toggle to disabled)
7. Click **Save**

### Step 2: Configure Email Templates (Optional but Recommended)

1. In Supabase Dashboard, go to: **Authentication** → **Email Templates**
2. Update these templates:

#### Confirmation Email Template
```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

#### Reset Password Template
```html
<h2>Reset Password</h2>
<p>Follow this link to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### Step 3: Set Redirect URLs

1. Go to: **Authentication** → **URL Configuration**
2. Add these to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   http://localhost:3000/**
   https://your-domain.com/auth/callback
   ```

### Step 4: Enable Row Level Security (RLS) - IMPORTANT

If you plan to use the profiles table:

1. Go to: **Database** → **Tables**
2. Find the **profiles** table (create it if it doesn't exist)
3. Enable RLS (toggle on)
4. Add these policies:

#### Policy 1: Users can view their own profile
```sql
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

#### Policy 2: Users can update their own profile
```sql
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

#### Policy 3: Create profile on signup
```sql
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);
```

### Step 5: Create Profiles Table (If Not Exists)

Run this SQL in Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 🚀 Testing Your Authentication

### Test Signup Flow

1. **Without Email Confirmation** (Recommended for Dev):
   - Go to: http://localhost:3000/auth/signup
   - Enter email and password
   - Click "Create Account"
   - Should automatically log in and redirect to dashboard
   - ✅ No email verification needed

2. **With Email Confirmation** (Production):
   - Enable email confirmation in Supabase
   - User will receive email with confirmation link
   - Must click link before they can log in

### Test Login Flow

1. Go to: http://localhost:3000/auth/login
2. Enter email and password
3. Click "Sign In"
4. Should redirect to `/dashboard` or the page you were trying to access

### Test Forgot Password

1. Go to: http://localhost:3000/auth/forgot-password
2. Enter email
3. Click "Send Reset Link"
4. Check email for reset link
5. Click link to reset password

## 🔍 Troubleshooting

### Issue: "Email not confirmed"
**Solution**: Disable email confirmation in Supabase Auth settings (Step 1 above)

### Issue: "User not redirecting after login"
**Solution**: Clear browser cache and cookies, restart dev server

### Issue: "Invalid API credentials"
**Solution**: Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Issue: "User can login but can't access protected routes"
**Solution**: 
- Clear `.next` folder: `rm -rf .next`
- Restart dev server: `npm run dev`
- Clear browser cookies for localhost

### Issue: "Not receiving emails"
**Solution**: 
- Check Supabase Auth → Settings → SMTP settings
- For development, use Supabase's default email service
- For production, configure custom SMTP (Gmail, SendGrid, etc.)

## 📧 Email Configuration (Production)

### Using Custom SMTP (Recommended for Production)

1. Go to: **Project Settings** → **Auth** → **SMTP Settings**
2. Enable custom SMTP
3. Add your SMTP credentials:
   ```
   Host: smtp.gmail.com (for Gmail)
   Port: 587
   Username: your-email@gmail.com
   Password: your-app-password
   Sender email: noreply@your-domain.com
   Sender name: TAP[IMAGINE]
   ```

### Using Gmail for Development

1. Create a Gmail App Password:
   - Go to Google Account → Security
   - Enable 2-Factor Authentication
   - Generate App Password
2. Use that password in SMTP settings

## ✅ Final Checklist

- [ ] Email confirmation disabled in Supabase (for dev)
- [ ] Redirect URLs configured
- [ ] Profiles table created with RLS
- [ ] Environment variables set in `.env.local`
- [ ] Dev server restarted
- [ ] Browser cache cleared
- [ ] Test signup works
- [ ] Test login works
- [ ] Test forgot password works
- [ ] Protected routes redirect correctly

## 🎯 Current Status

Your configuration:
```
URL: https://hxmojhummwuvfjtgzpzo.supabase.co
Anon Key: eyJhbGc... (configured ✅)
Gemini API: AIzaSy... (configured ✅)
```

**After following this guide, your authentication should work perfectly!** 🚀
