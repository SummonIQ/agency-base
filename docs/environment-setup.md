# Environment Setup Guide

This guide helps you configure the required environment variables for API integrations in your business system.

## Required Environment Variables

Add these variables to your `.env.local` file:

### Email Automation (SendGrid)
```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME="Your Business Name"
```

**Setup Steps:**
1. Sign up at [SendGrid](https://sendgrid.com)
2. Go to Settings > API Keys
3. Create a new API key with "Full Access" permissions
4. Copy the API key to your `.env.local` file

### Lead Data Integration

#### Apollo.io
```bash
# Apollo.io Configuration
APOLLO_API_KEY=your_apollo_api_key_here
APOLLO_BASE_URL=https://api.apollo.io/v1
```

**Setup Steps:**
1. Sign up at [Apollo.io](https://apollo.io)
2. Go to Settings > Integrations > API
3. Generate an API key
4. Copy the API key to your `.env.local` file

#### ZoomInfo
```bash
# ZoomInfo Configuration
ZOOMINFO_API_KEY=your_zoominfo_api_key_here
ZOOMINFO_USERNAME=your_zoominfo_username
```

**Setup Steps:**
1. Contact ZoomInfo for API access
2. Obtain your API credentials
3. Add them to your `.env.local` file

### LinkedIn Integration
```bash
# LinkedIn OAuth Configuration
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=https://yourdomain.com/auth/linkedin/callback
```

**Setup Steps:**
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com)
2. Create a new app
3. Add your domain to authorized redirect URLs
4. Copy credentials to your `.env.local` file

## Testing Your Configuration

1. Navigate to `/settings/integrations` in your application
2. Enter your API credentials for each service
3. Click "Test Connection" to verify each integration
4. Save your configuration once tests pass

## Security Best Practices

- Never commit `.env.local` to version control
- Use different API keys for development and production
- Regularly rotate your API keys
- Monitor API usage and set up alerts for unusual activity
- Use environment-specific configurations

## Pricing Information

### SendGrid
- Free tier: 100 emails/day
- Essentials: $19.95/month (50K emails)
- Pro: $89.95/month (100K emails)

### Apollo.io
- Free tier: 60 email credits/month
- Basic: $49/month (1K credits)
- Professional: $79/month (3K credits)

### ZoomInfo
- Contact sales for pricing
- Typically $15K-50K+ annually

### LinkedIn Sales Navigator
- Core: $79.99/month
- Advanced: $134.99/month
- Advanced Plus: $224.99/month

## Troubleshooting

### SendGrid Issues
- Verify your domain authentication
- Check sender reputation
- Ensure API key has correct permissions

### Apollo.io Issues
- Check credit balance
- Verify API key permissions
- Review rate limiting

### ZoomInfo Issues
- Confirm API access is enabled
- Check authentication credentials
- Verify subscription status

### LinkedIn Issues
- Ensure app is approved for production
- Check OAuth redirect URLs
- Verify app permissions

## Next Steps

Once your integrations are configured:

1. **Email Automation**: Create email templates and sequences
2. **Lead Generation**: Set up automated lead discovery
3. **LinkedIn Outreach**: Configure connection automation
4. **Analytics**: Monitor performance across all channels

For support, check the documentation links in the integrations interface or contact the respective API providers.
