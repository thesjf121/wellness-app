# 🚀 WellnessApp Production Deployment Guide

## Overview
This guide will help you deploy the WellnessApp to production using Render.com. The application is configured for static site hosting with environment-based configuration.

## Prerequisites

Before deploying, you'll need:

1. **GitHub Repository**: Ensure your code is pushed to GitHub
2. **Render.com Account**: Sign up at https://render.com
3. **Clerk Account**: Set up authentication at https://clerk.com
4. **Google AI Studio Account** (Optional): For Gemini API at https://aistudio.google.com

## Step 1: Set Up Clerk Authentication

1. **Create Clerk Application**:
   - Go to https://clerk.com/dashboard
   - Create a new application
   - Choose "React" as your framework
   - Copy your **Publishable Key** (starts with `pk_live_` for production)

2. **Configure Clerk Settings**:
   - Enable the sign-in/sign-up methods you want (email, Google, etc.)
   - Set up your application's appearance and branding
   - Configure user metadata fields if needed

## Step 2: Set Up Google Gemini API (Optional)

1. **Get API Key**:
   - Go to https://aistudio.google.com
   - Create a new project or use existing
   - Generate an API key for Gemini Pro
   - Copy the API key

2. **Note**: If you skip this step, the app will work in offline mode for nutrition analysis.

## Step 3: Deploy to Render

### Option A: Automatic Deployment (Recommended)

1. **Connect Repository**:
   - Log in to Render.com
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Select the `wellness-app` repository

2. **Configure Build Settings**:
   - Render will automatically detect the `render.yaml` configuration
   - Verify these settings:
     - **Build Command**: `npm install && npm run build`
     - **Publish Directory**: `build`
     - **Environment**: `Node`

3. **Set Environment Variables**:
   Go to your site's Environment tab and add:

   **Required Variables:**
   ```
   REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_clerk_key_here
   ```

   **Optional Variables:**
   ```
   REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

   **Pre-configured Variables** (already set in render.yaml):
   - `NODE_ENV=production`
   - `REACT_APP_ENVIRONMENT=production`
   - `REACT_APP_APP_NAME=WellnessApp`
   - `REACT_APP_APP_VERSION=1.0.0`
   - `REACT_APP_ENABLE_OFFLINE_MODE=true`
   - `REACT_APP_ENABLE_ANALYTICS=true`
   - `REACT_APP_HEALTH_KIT_ENABLED=true`
   - `REACT_APP_GOOGLE_FIT_ENABLED=true`

4. **Deploy**:
   - Click "Create Static Site"
   - Render will build and deploy your application
   - You'll get a URL like `https://wellness-app-xyz.onrender.com`

### Option B: Manual Configuration

If you prefer manual setup:

1. Create a new Static Site on Render
2. Connect your repository
3. Use these build settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Add all environment variables manually
5. Deploy

## Step 4: Configure Custom Domain (Optional)

1. **Purchase Domain**: Buy a domain from any registrar
2. **Add Domain in Render**:
   - Go to your site's Settings
   - Click "Custom Domains"
   - Add your domain (e.g., `wellnessapp.com`)
3. **Update DNS**: Point your domain to Render's servers
4. **SSL Certificate**: Render automatically provides SSL

## Step 5: Test Production Deployment

After deployment, test these key features:

### Authentication Flow
- [ ] User registration works
- [ ] User login works  
- [ ] Protected routes redirect to login
- [ ] User profile loads correctly
- [ ] Sign out works

### Core Features
- [ ] Dashboard loads with widgets
- [ ] Step counter interface works
- [ ] Food journal accepts entries
- [ ] Training modules are accessible
- [ ] Groups functionality works
- [ ] Welcome/onboarding flow works

### AI Features (if Gemini API configured)
- [ ] Food text analysis works
- [ ] Nutrition data is accurate
- [ ] Fallback to offline mode on API errors

### Mobile Responsiveness
- [ ] Site works on mobile devices
- [ ] Touch interactions work
- [ ] Navigation is mobile-friendly

## Step 6: Monitor and Maintain

### Monitoring
- **Render Dashboard**: Monitor build logs and performance
- **Browser Console**: Check for JavaScript errors
- **Clerk Dashboard**: Monitor authentication metrics
- **User Feedback**: Collect and respond to user issues

### Maintenance
- **Regular Updates**: Keep dependencies updated
- **Security**: Monitor for security vulnerabilities
- **Performance**: Track load times and optimize
- **Backups**: Render handles this automatically

## Troubleshooting

### Common Issues

**Build Fails**:
- Check build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Verify environment variables are set

**Authentication Errors**:
- Verify Clerk publishable key is correct
- Check Clerk dashboard for error logs
- Ensure domain is added to Clerk's allowed origins

**White Screen/Blank Page**:
- Check browser console for JavaScript errors
- Verify environment variables are set correctly
- Check if routing is working (try direct URL access)

**Gemini API Errors**:
- Verify API key is correct and active
- Check Google AI Studio for usage limits
- App will fallback to offline mode on API failures

### Support Resources

- **Render Documentation**: https://render.com/docs
- **Clerk Documentation**: https://clerk.com/docs
- **React Documentation**: https://react.dev
- **GitHub Issues**: Create issues in your repository

## Security Considerations

The deployment includes several security measures:

- **HTTPS**: Automatic SSL certificate
- **Security Headers**: XSS protection, content type restrictions
- **Environment Variables**: Sensitive data not in code
- **Authentication**: Secure user management via Clerk
- **Input Validation**: Form data validation
- **Error Handling**: Graceful error boundaries

## Performance Optimization

The deployment is optimized for performance:

- **Static Hosting**: Fast content delivery
- **Caching**: Long cache times for static assets
- **Code Splitting**: React lazy loading
- **Minification**: Production build optimization
- **CDN**: Render's global CDN

## Next Steps

After successful deployment:

1. **Share with Users**: Your app is live and ready to use!
2. **Collect Feedback**: Monitor user behavior and feedback
3. **Iterate**: Plan future features and improvements
4. **Scale**: Upgrade Render plan as usage grows

Your WellnessApp is now live in production! 🎉