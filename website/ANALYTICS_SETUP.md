# Analytics Setup Guide

This website includes comprehensive Google Analytics 4 (GA4) tracking to help you understand user behavior and measure key metrics.

## 🎯 What We Track

### Download Events
- **Download Clicks**: Every download button click is tracked with location labels
  - `header_download` - Download link in header
  - `hero_primary_cta` - Main download button in hero section
  - `download_section_cta` - Download button in dedicated download section

### External Link Clicks
- **GitHub Links**: Tracked separately for header and footer
- **Discord Links**: Tracked separately for header and footer
- **OpenAI API Keys Link**: Track interest in API setup
- **Author Link**: Track footer attribution link clicks

### Call-to-Action (CTA) Interactions
- **View on GitHub**: Hero section CTA button
- All major CTAs with location tracking

### Section Visibility Tracking
Automatically tracks when users scroll to and view each section:
- Hero Section
- Features Section
- How It Works Section
- Pricing Section
- FAQ Section

This helps you understand:
- Which sections get the most attention
- Where users drop off
- Content engagement patterns

## 🚀 Setup Instructions

### 1. Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon in bottom left)
3. Under **Property**, click **Create Property**
4. Fill in your property details:
   - Property name: "ezspeak Website"
   - Time zone and currency
   - Click **Next**
5. Fill in business details and click **Create**
6. Accept the Terms of Service
7. Choose your platform: **Web**
8. Set up your web stream:
   - Website URL: Your production URL
   - Stream name: "ezspeak Production"
   - Click **Create stream**

### 2. Get Your Measurement ID

After creating the stream, you'll see your **Measurement ID** (format: `G-XXXXXXXXXX`)

Copy this ID - you'll need it in the next step.

### 3. Configure Your Environment

#### For Local Development

Create a `.env.local` file in the `website/` directory:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

#### For Production (Vercel, Netlify, etc.)

Add the environment variable in your hosting platform:

**Vercel:**
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX`
4. Redeploy your application

**Netlify:**
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add: `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-XXXXXXXXXX`
4. Redeploy your application

### 4. Verify It's Working

1. Deploy your website or run locally with `npm run dev`
2. Open your website in a browser
3. Open Google Analytics → **Reports** → **Realtime**
4. You should see your visit appear in real-time!

## 📊 Key Metrics to Track

### Downloads
- **Event Name**: `download_click`
- **Parameters**: 
  - `download_location`: Where the download was initiated
  - `category`: "Downloads"

### Engagement
- **Event Name**: `section_view`
- **Parameters**:
  - `section_name`: Name of the section viewed
  - `category`: "Engagement"

### External Links
- **Event Name**: `external_link_click`
- **Parameters**:
  - `link_destination`: URL of the external link
  - `label`: Descriptive label
  - `category`: "Engagement"

## 📈 Creating Custom Reports

### Download Conversion Funnel

1. In GA4, go to **Explore** → Create a new exploration
2. Choose **Funnel exploration**
3. Set up steps:
   - Step 1: `page_view` (Landing)
   - Step 2: `section_view` where `section_name` = "hero"
   - Step 3: `download_click`

### Most Popular Sections

1. Go to **Explore** → Create a new exploration
2. Choose **Free form**
3. Add dimension: `event_name`
4. Add metric: `event_count`
5. Filter to only show `section_view` events
6. Breakdown by `section_name`

### Link Click Analysis

1. Go to **Reports** → **Engagement** → **Events**
2. Click on `external_link_click` event
3. View by `link_destination` to see which external links are most popular

## 🔒 Privacy Considerations

- Analytics only tracks anonymized user interactions
- No personally identifiable information (PII) is collected
- IP addresses are anonymized by default in GA4
- Users can block analytics with browser extensions
- Consider adding a privacy policy page mentioning analytics usage

## 🎛️ Advanced: Custom Event Tracking

To track additional custom events, use the utility functions in `src/lib/analytics.ts`:

```typescript
import { trackEvent } from '@/lib/analytics'

// Track a custom event
trackEvent('button_click', {
  category: 'Engagement',
  label: 'special_feature',
  value: 1
})
```

## 🐛 Troubleshooting

### Analytics Not Showing Up

1. **Check Environment Variable**: Ensure `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
2. **Check Browser**: Disable ad blockers and privacy extensions temporarily
3. **Check Console**: Open browser DevTools and look for any JavaScript errors
4. **Wait**: Real-time data can take 1-2 minutes to appear
5. **Check Measurement ID**: Verify it starts with `G-` not `UA-` (old Universal Analytics)

### Events Not Tracking

1. Open browser DevTools → Network tab
2. Filter by "collect"
3. Click a tracked button/link
4. You should see a request to `google-analytics.com/g/collect`

## 📚 Additional Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Event Tracking](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Next.js Analytics Guide](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)

---

**Questions?** Check the [Google Analytics Help Center](https://support.google.com/analytics) or create an issue in the repository.






