# CI/CD Setup Guide

## ✅ What's Already Configured

### GitHub Actions Workflows

Two workflows have been set up in `.github/workflows/`:

1. **`ci.yml`** - Continuous Integration
   - Runs on push/PR to `main` and `develop` branches
   - Linting and type checking
   - Build validation
   - Uploads build artifacts

2. **`deploy.yml`** - Deployment
   - Runs on push to `main` branch
   - Deploys to Vercel production
   - Requires Vercel tokens (see below)

### Git Repository

- ✅ Repository initialized
- ✅ Initial commit created
- ✅ Pushed to GitHub: https://github.com/getmobilehq/tailorspace
- ✅ `.gitignore` configured (excludes `.env.local`, `node_modules`, etc.)

---

## 🔐 Required GitHub Secrets

To enable the CI/CD pipelines, you need to add the following secrets to your GitHub repository:

### Go to: Repository Settings → Secrets and variables → Actions → New repository secret

1. **`NEXT_PUBLIC_SUPABASE_URL`**
   - Your Supabase project URL
   - Value: `https://cviuuxbngfagwrclgeev.supabase.co`

2. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - Your Supabase anon/public key
   - Get from: Supabase Dashboard → Settings → API

3. **`VERCEL_TOKEN`** (for deployment workflow)
   - Create at: https://vercel.com/account/tokens
   - Name it "GitHub Actions Deploy"
   - Copy the token (you won't see it again!)

4. **`VERCEL_ORG_ID`**
   - Get from: Vercel Dashboard → Settings → General
   - Or run: `vercel whoami` in your project

5. **`VERCEL_PROJECT_ID`**
   - Get from: Vercel project settings
   - Or from `.vercel/project.json` after first `vercel` command

---

## 📦 Vercel Deployment Setup

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Import from GitHub: `getmobilehq/tailorspace`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. **Environment Variables** - Add all from `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   TWILIO_ACCOUNT_SID
   TWILIO_AUTH_TOKEN
   TWILIO_WHATSAPP_NUMBER
   NEXT_PUBLIC_SITE_URL
   ```

6. Click "Deploy"

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

---

## 🔔 Stripe Webhook Setup

After deploying to Vercel, update your Stripe webhook:

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://your-vercel-domain.vercel.app/api/payments/webhook`
4. Events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret
6. Add to Vercel env vars: `STRIPE_WEBHOOK_SECRET`

---

## 🚀 How CI/CD Works

### When you push to `main`:

1. **CI Pipeline runs:**
   - ✅ Lints code
   - ✅ Type checks TypeScript
   - ✅ Builds the project
   - ✅ Stores build artifacts

2. **Deploy Pipeline runs:**
   - ✅ Pulls Vercel environment
   - ✅ Builds for production
   - ✅ Deploys to Vercel
   - ✅ Your site is live!

### When you push to `develop`:

- Only CI pipeline runs (no deployment)
- Perfect for testing before merging to main

### On Pull Requests:

- CI pipeline validates the changes
- No deployment happens
- Ensures code quality before merging

---

## 📊 Monitoring & Logs

### GitHub Actions Logs
- View at: https://github.com/getmobilehq/tailorspace/actions
- See build status, errors, and deployment logs

### Vercel Deployment Logs
- View at: https://vercel.com/dashboard
- Real-time logs during deployment
- Function logs for API routes

### Supabase Logs
- Database queries: Supabase Dashboard → Logs
- Auth events: Authentication → Logs
- Storage access: Storage → Logs

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Run database migrations (via Supabase Dashboard)
# See DATABASE_SETUP.md

# Start development server
npm run dev

# Server runs on: http://localhost:3000
```

---

## ✅ Checklist

- [ ] Add GitHub secrets (Supabase, Vercel)
- [ ] Connect Vercel to GitHub repository
- [ ] Configure Vercel environment variables
- [ ] Deploy to Vercel
- [ ] Setup Stripe webhook with production URL
- [ ] Test a push to main branch
- [ ] Verify CI/CD pipeline runs successfully
- [ ] Check deployment on Vercel

---

## 🎯 Current Status

- ✅ Code committed to GitHub
- ✅ CI/CD workflows configured
- ⏳ Awaiting GitHub secrets configuration
- ⏳ Awaiting Vercel deployment setup

**Repository:** https://github.com/getmobilehq/tailorspace

**Next Steps:** Add GitHub secrets and deploy to Vercel
