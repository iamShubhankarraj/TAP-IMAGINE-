# Analytics Implementation

This document describes the analytics implementation for TAP[IMAGINE].

## Overview

The analytics system provides a centralized way to track user events, page views, and interactions throughout the application. It's designed to be flexible and easy to integrate with popular analytics providers.

## Usage

### Tracking Page Views

```typescript
import { trackPageView } from '@/lib/analytics';

// In a component
useEffect(() => {
  trackPageView('/your-page-path');
}, []);
```

### Tracking Events

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a custom event
trackEvent('button_clicked', {
  button_name: 'Start Creating',
  location: 'hero',
});
```

### Tracking CTAs

```typescript
import { trackCTA } from '@/lib/analytics';

// Track CTA clicks
<button onClick={() => trackCTA('Get Started', 'hero')}>
  Get Started
</button>
```

### Tracking Auth Events

```typescript
import { trackSignUp, trackLogin } from '@/lib/analytics';

// Track sign up
await signUp(email, password);
trackSignUp('email');

// Track login
await signIn(email, password);
trackLogin('email');
```

### Tracking Features

```typescript
import { trackFeature } from '@/lib/analytics';

// Track feature usage
trackFeature('image_generation', {
  prompt: userPrompt,
  aspectRatio: selectedRatio,
});
```

### Identifying Users

```typescript
import { identifyUser } from '@/lib/analytics';

// Identify a user after login
identifyUser(user.id, {
  email: user.email,
  name: user.name,
});
```

## Integration with Analytics Providers

The current implementation is a placeholder. To integrate with a specific analytics provider:

1. **Google Analytics 4**: Uncomment the GA4 code in `lib/analytics.ts` and add your tracking ID
2. **Mixpanel**: Uncomment the Mixpanel code and add your project token
3. **Segment**: Uncomment the Segment code and add your write key

### Example: Google Analytics 4

```typescript
// In lib/analytics.ts, uncomment:
if (typeof window !== 'undefined' && (window as any).gtag) {
  (window as any).gtag('event', analyticsEvent.name, analyticsEvent.properties);
}
```

Then add the GA4 script to your `app/layout.tsx`:

```typescript
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'GA_MEASUREMENT_ID');
  `}
</Script>
```

## Events Currently Tracked

### Page Views
- Homepage (/)
- Editor (/editor)
- Login (/auth/login)
- Signup (/auth/signup)

### CTA Clicks
- "Start Creating" (Hero)
- "Explore Templates" (Hero)
- "Get Started Free" (Bottom CTA)
- "Create Your Own" (Showcase)
- Template style clicks

### Auth Events
- Sign up (email)
- Login (email)

### Feature Usage
- Image generation with prompts

## Development vs Production

In development mode, all analytics events are logged to the console. In production, they are sent to your configured analytics provider.

## Privacy Considerations

- Ensure compliance with GDPR, CCPA, and other privacy regulations
- Implement cookie consent banners if required
- Provide users with opt-out options
- Don't track personally identifiable information (PII) without consent
