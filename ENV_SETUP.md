# Environment Variables Setup Guide

## Required API Keys

### 1. Google Gemini API Key

To use the AI image generation features, you need a Gemini API key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key
5. Open `.env.local` in your project root
6. Replace `your_gemini_api_key_here` with your actual API key

```env
NEXT_PUBLIC_GEMINI_API_KEY=AIza...your-actual-key-here
```

### 2. Supabase Configuration (Optional)

If you're using Supabase for authentication and database:

1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy your Project URL and anon/public key
5. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-actual-key-here
```

## After Setting Environment Variables

1. Save the `.env.local` file
2. Restart your development server:
   ```bash
   # Stop the current server (Ctrl+C)
   # Then run:
   npm run dev
   ```

## Verify Setup

- The Gemini API warning should disappear from the console
- The editor page should load without errors
- You can test AI generation in the editor

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` to version control (it's already in `.gitignore`)
- Never share your API keys publicly
- Rotate keys if accidentally exposed
- Use environment-specific keys for development vs production

## Troubleshooting

### "GEMINI_API_KEY is not set" Warning
- Ensure you've replaced `your_gemini_api_key_here` with your actual key
- Restart the development server after changes
- Check that the file is named exactly `.env.local` (not `.env` or `env.local`)

### "Supabase URL is required" Error
- If not using Supabase, you can ignore this for development
- Or add dummy values to `.env.local` to suppress the error
- For production, proper Supabase setup is recommended

## Need Help?

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Environment Variables Guide](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
