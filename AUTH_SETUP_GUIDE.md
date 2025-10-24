# Authentication Setup Guide for TAP[IMAGINE]

## Overview
This guide will help you set up the authentication system for TAP[IMAGINE] using Supabase. The auth system includes:
- Email/password authentication
- User profile management
- Protected routes
- Automatic profile creation on signup

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier is sufficient)
- TAP[IMAGINE] project cloned locally

## Step 1: Set up Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to be ready (2-3 minutes)
4. Go to Project Settings > API
5. Copy the Project URL and Anon Key

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in the root of your project:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Other configuration
NODE_ENV=development
```

## Step 3: Set up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration script from `supabase/migrations/001_create_profiles.sql`

This will create:
- `profiles` table for user data
- `projects` table for user projects
- `templates` table for templates
- Proper Row Level Security (RLS) policies
- Triggers for automatic profile creation

## Step 4: Configure Authentication Settings

1. In Supabase dashboard, go to Authentication > Settings
2. Configure the following:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: `http://localhost:3000/auth/callback`
   - Email confirmation: Enable or disable based on your preference

## Step 5: Test the Authentication

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000/auth`

3. Test signup:
   - Click "Sign Up"
   - Enter email and password
   - Submit the form
   - Check email for confirmation (if enabled)

4. Test login:
   - Click "Sign In"
   - Enter credentials
   - Should redirect to dashboard

## Step 6: Verify Database

1. In Supabase dashboard, go to Table Editor
2. Check the `profiles` table - should have user entries
3. Check the `auth.users` table - should show authenticated users

## Common Issues & Solutions

### Issue: "Invalid login credentials"
- Solution: Verify email and password are correct
- Check if user confirmed email (if confirmation is enabled)

### Issue: Redirect loops
- Solution: Clear browser cookies/localStorage
- Check middleware configuration

### Issue: Profile not created
- Solution: Check the database migration was applied
- Verify RLS policies are correctly set

### Issue: CORS errors
- Solution: Ensure redirect URLs are properly configured in Supabase

## Authentication Flow

1. **Signup Flow:**
   - User enters email/password
   - Account created in Supabase Auth
   - Profile automatically created in database
   - Email confirmation sent (if enabled)
   - User redirected to dashboard after confirmation

2. **Login Flow:**
   - User enters credentials
   - Supabase validates credentials
   - Session created
   - User redirected to intended destination

3. **Protected Routes:**
   - Middleware checks authentication
   - Unauthenticated users redirected to `/auth`
   - Authenticated users can access dashboard, editor

## Features Included

- ✅ Email/password authentication
- ✅ Automatic profile creation
- ✅ Protected routes with middleware
- ✅ Session management
- ✅ Profile updates
- ✅ Avatar upload
- ✅ Password reset
- ✅ Email confirmation (optional)
- ✅ Row Level Security
- ✅ Tier-based access control

## Next Steps

1. Configure email templates in Supabase
2. Set up social providers (Google, GitHub) if needed
3. Configure custom domains for production
4. Set up proper error monitoring
5. Add analytics for authentication events

## Production Checklist

- [ ] Update Site URL to production domain
- [ ] Configure production redirect URLs
- [ ] Enable email confirmation
- [ ] Set up custom SMTP (optional)
- [ ] Configure rate limiting
- [ ] Set up monitoring for auth events
- [ ] Test complete auth flow in production

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase configuration
3. Check the database schema
4. Review the middleware configuration
5. Check environment variables

The authentication system is now ready for use! 🎉