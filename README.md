# TAP[IMAGINE] - AI-Powered Image Editor

An advanced image editing application using Google Nano Banana AI for creative transformations, professional adjustments, and imaginative templates.

## Features

- AI-powered image editing with text prompts
- Multiple reference image uploads
- 20+ creative templates
- Professional image adjustments
- Custom filters and effects
- Multiple export options
- User authentication
- High-quality image processing
- **Results Page** with:
  - Before/after comparison slider
  - Version history tracking
  - Quick adjustments panel
  - Share and export options
  - Session persistence with Supabase
  - Continue editing from saved states

## Getting Started

1. Clone this repository
2. Install dependencies with `npm install`
3. Set up environment variables (see below)
4. Run the development server with `npm run dev`

## Environment Configuration

The application supports two AI services and Supabase for data persistence:

### 1. Simulated Mode (Default - No API Keys Required)

By default, the app runs in development mode with simulated AI responses. This is perfect for testing and development without needing API keys.

Just create a `.env` file (or use the default settings) and the app will work out of the box!

### 2. Production Mode (Real AI APIs + Supabase)

To use real AI processing and data persistence, you need to configure API keys:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Add your API keys:
   - **API_KEY**: Google Gemini API key (for standalone React app)
     - Get it from: https://makersuite.google.com/app/apikey
   - **GOOGLE_NANO_BANANA_API_KEY**: Google Nano Banana API key (for Next.js editor)
     - This is optional - simulation mode works without it
   - **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
   - **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anonymous key
     - Get these from: https://app.supabase.com

3. Set `NODE_ENV=production` in your `.env` file to enable real API calls

### 3. Database Setup

To use the results page and session persistence features, you need to set up the Supabase database:

1. Create a new Supabase project at https://app.supabase.com
2. Run the SQL schema from `lib/supabase/schema.sql` in your Supabase SQL editor
3. This will create the necessary tables and Row Level Security policies

## AI Service Architecture

- **Next.js Editor (`/editor`)**: Uses the Google Nano Banana AI service with automatic fallback to simulation mode
- **Standalone React App**: Uses Google Gemini API for image editing
- Both services provide proper error handling and user feedback

## Error Handling

The app includes comprehensive error handling for AI services:
- Graceful fallback to simulation mode if API keys are missing
- User-friendly error messages for all failure scenarios
- Automatic retry mechanisms for transient failures
- Detailed logging for debugging
