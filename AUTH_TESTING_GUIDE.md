# Authentication Testing & Troubleshooting Guide

## 🚀 Complete Authentication Flow - Step by Step

### ✅ Prerequisites Checklist

Before testing, ensure:
- [ ] Supabase credentials are in `.env.local`
- [ ] Dev server is running (`npm run dev`)
- [ ] Browser cache is cleared
- [ ] Supabase email confirmation is **DISABLED** (see SUPABASE_SETUP.md)

---

## 📝 Test 1: Sign Up Flow

### Steps:
1. Open: http://localhost:3000
2. Click "Get Started Free" or "Sign Up"
3. Enter:
   - Email: `test@example.com`
   - Password: `password123` (min 8 chars)
   - Confirm Password: `password123`
4. Click "Create Account"

### Expected Result:
- ✅ **With email confirmation DISABLED**: Automatically logged in → Redirected to `/dashboard`
- ⏰ **With email confirmation ENABLED**: Success message → Check email → Click verification link

### If It Fails:
```
Error: "User already registered"
→ Solution: Use a different email or delete user from Supabase dashboard

Error: "Invalid email"
→ Solution: Use a valid email format

Error: "Password too short"
→ Solution: Use at least 8 characters

Error: "Failed to create account"
→ Solution: Check Supabase dashboard for errors, ensure RLS policies are correct
```

---

## 🔐 Test 2: Sign In Flow

### Steps:
1. Go to: http://localhost:3000/auth/login
2. Enter credentials used in signup
3. Click "Sign In"

### Expected Result:
- ✅ Redirected to `/dashboard` (or the page you were trying to access)
- ✅ User menu shows in navbar with email
- ✅ Can access protected routes like `/editor`

### If It Fails:
```
Error: "Invalid login credentials"
→ Solution: 
  1. Check email/password are correct
  2. If email confirmation is enabled, verify email first
  3. Check Supabase Auth → Users to see if account exists

Error: "Email not confirmed"
→ Solution: Disable email confirmation in Supabase OR check email for verification link

Logs in but doesn't redirect:
→ Solution:
  1. Clear browser cache and cookies
  2. Restart dev server
  3. Check browser console for errors
  4. Delete .next folder: rm -rf .next
```

---

## 🔒 Test 3: Protected Routes

### Steps:
1. **While logged OUT**, try to access:
   - http://localhost:3000/editor
   - http://localhost:3000/dashboard

### Expected Result:
- ✅ Redirected to `/auth?mode=login/auth/login?redirect=redirect=/editor` (or `/dashboard`)
- ✅ After login, automatically sent to the page you wanted

### Steps:
2. **While logged IN**, access these routes directly

### Expected Result:
- ✅ Can access `/editor` and `/dashboard` without redirect
- ✅ Middleware allows passage

### If It Fails:
```
Can access protected routes without login:
→ Solution: Check middleware.ts is correct and .next is cleared

Infinite redirect loop:
→ Solution:
  1. Clear cookies for localhost
  2. Check auth-context.tsx for errors
  3. Restart dev server
```

---

## 🔑 Test 4: Forgot Password Flow

### Steps:
1. Go to: http://localhost:3000/auth/forgot-password
2. Enter your email
3. Click "Send Reset Link"

### Expected Result:
- ✅ Success message appears
- ✅ Check email inbox for reset link
- ✅ Click link in email

### Steps (continued):
4. Taken to reset password page
5. Enter new password (twice)
6. Click "Reset Password"

### Expected Result:
- ✅ Success message
- ✅ Can log in with new password

### If It Fails:
```
No email received:
→ Solution:
  1. Check spam folder
  2. Verify SMTP settings in Supabase
  3. For dev, Supabase uses its default email (may be slow)
  4. Check Supabase Auth → Email Templates are configured

Reset link doesn't work:
→ Solution:
  1. Check redirect URLs in Supabase include /auth/reset-password
  2. Link expires after 1 hour - request new one
  3. Clear cookies and try again

Can't set new password:
→ Solution: Check browser console for errors
```

---

## 👤 Test 5: Sign Out Flow

### Steps:
1. While logged in, click user menu (top right)
2. Click "Sign Out"

### Expected Result:
- ✅ Logged out successfully
- ✅ Redirected to home page (`/`)
- ✅ Can't access protected routes anymore
- ✅ User menu shows "Log In" / "Sign Up" again

---

## 🐛 Common Issues & Solutions

### Issue 1: "Supabase URL is required" error
```bash
Solution:
1. Check .env.local exists in project root
2. Verify it contains:
   NEXT_PUBLIC_SUPABASE_URL=https://hxmojhummwuvfjtgzpzo.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
3. Restart dev server after changes
```

### Issue 2: Auth works but user can't access /editor or /dashboard
```bash
Solution:
1. rm -rf .next
2. npm run dev
3. Clear browser cookies
4. Try logging in again
```

### Issue 3: "Session not found" or "Invalid session"
```bash
Solution:
1. Sign out completely
2. Clear all cookies for localhost
3. Close and reopen browser
4. Sign in again
```

### Issue 4: Redirect loops (keeps redirecting to login)
```bash
Solution:
1. Check middleware.ts protected routes array
2. Clear .next: rm -rf .next
3. Clear browser data
4. Check auth-context for isLoading state issues
```

### Issue 5: Email confirmation emails not sending
```bash
Solution:
Development:
→ Disable email confirmation in Supabase (recommended)

Production:
→ Configure SMTP in Supabase dashboard
→ Use Gmail, SendGrid, or other email service
```

---

## 🎯 Quick Debug Commands

### Clear everything and start fresh:
```bash
# Stop dev server (Ctrl+C)
rm -rf .next
npm run dev
# Clear browser cookies for localhost
# Test again
```

### Check if auth is working:
```bash
# Open browser console (F12)
# Paste this:
const { data: { session } } = await window.supabase?.auth.getSession()
console.log('Session:', session)
```

### Manual test in browser console:
```javascript
// Sign up
const { data, error } = await window.supabase?.auth.signUp({
  email: 'test@test.com',
  password: 'password123'
})
console.log('Signup:', { data, error })

// Sign in
const { data, error } = await window.supabase?.auth.signInWithPassword({
  email: 'test@test.com',
  password: 'password123'
})
console.log('Login:', { data, error })
```

---

## 📊 Expected Behavior Summary

| Action | Logged Out | Logged In |
|--------|-----------|-----------|
| Visit `/` | ✅ Works | ✅ Works |
| Visit `/editor` | → Redirect to login | ✅ Access granted |
| Visit `/dashboard` | → Redirect to login | ✅ Access granted |
| Visit `/auth/login` | ✅ Shows form | → Redirect to dashboard |
| Visit `/auth/signup` | ✅ Shows form | → Redirect to dashboard |

---

## 🎉 Success Criteria

Your authentication is working if ALL these are true:

- ✅ Can create account (signup)
- ✅ Can log in with credentials
- ✅ Redirected to dashboard after login
- ✅ Can access /editor when logged in
- ✅ Blocked from /editor when logged out
- ✅ Can request password reset
- ✅ Can log out successfully
- ✅ User menu shows correctly

---

## 📞 Still Having Issues?

### Check These Logs:

**Browser Console** (F12 → Console tab):
- Look for red errors
- Check for "403 Forbidden" or "401 Unauthorized"
- See authentication state

**Terminal** (where `npm run dev` is running):
- Check for compilation errors
- Look for Supabase connection issues
- Verify middleware is executing

**Supabase Dashboard**:
- Auth → Users: See if users are being created
- Auth → Logs: Check for auth events
- Database → Tables: Verify profiles table exists

---

## ✨ Pro Tips

1. **Use Incognito Mode** for testing to avoid cookie issues
2. **Test with different emails** to avoid conflicts
3. **Disable email confirmation** for development
4. **Clear .next folder** after major auth changes
5. **Check Supabase dashboard** Auth → Users to see all accounts
6. **Use browser console** to debug session state

---

**Your authentication is now production-ready!** 🚀
