# 🚀 TailorSpace Setup Guide

## ✅ Completed Steps

You've already provided:
- ✅ Stripe API Keys (Test Mode)
- ✅ Supabase Project URL & Anon Key
- ✅ OpenAI API Key

## 🔧 Remaining Setup Steps

### 1. Get Supabase Service Role Key

**Where to find it:**
1. Go to https://supabase.com/dashboard
2. Select your project: `cviuuxbngfagwrclgeev`
3. Click **Settings** → **API**
4. Copy the **`service_role` key** (secret)
5. Update `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUz... (your service role key)
   ```

⚠️ **Important:** This key has admin privileges - keep it secret!

---

### 2. Setup Database (Supabase)

**Run the migration files:**

1. Go to https://supabase.com/dashboard
2. Open your project → **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `db/migrations/001_comprehensive_schema.sql`
5. Click **Run**
6. Repeat for `db/migrations/002_rls_policies.sql`

**Create Storage Buckets:**

1. Go to **Storage** in Supabase dashboard
2. Create these buckets:
   - `order_photos` (Public: false)
   - `voice_notes` (Public: false)
   - `profile_photos` (Public: false)

---

### 3. Setup Twilio WhatsApp (Optional - Can Skip for Now)

**For WhatsApp automation, you need:**

#### Option A: Twilio WhatsApp Sandbox (Free, for testing)
1. Go to https://console.twilio.com
2. Sign up for a free account
3. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
4. Follow the instructions to join the sandbox
5. Get your credentials:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)
   - **Sandbox Number** (e.g., `whatsapp:+14155238886`)

Update `.env.local`:
```bash
TWILIO_ACCOUNT_SID=AC... (your account SID)
TWILIO_AUTH_TOKEN=... (your auth token)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

#### Option B: Skip WhatsApp for Now (Recommended for Initial Testing)
You can disable WhatsApp features temporarily and test the core functionality:

Update `.env.local`:
```bash
TWILIO_ACCOUNT_SID=skip
TWILIO_AUTH_TOKEN=skip
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

The app will work without WhatsApp - notifications just won't send.

---

### 4. Setup Stripe Webhook (For Production)

**For local development:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payments/webhook
```

Copy the webhook signing secret (starts with `whsec_...`) and add to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_... (from stripe listen command)
```

**For production deployment:**
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-domain.com/api/payments/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
5. Copy the signing secret to your production environment variables

---

## 🎯 Quick Start Checklist

### Minimum to Run Dev Server:
- [x] Stripe keys added
- [x] Supabase URL + Anon Key added
- [x] OpenAI key added
- [ ] **Supabase Service Role Key** (REQUIRED)
- [ ] **Database migrations run** (REQUIRED)
- [ ] Twilio credentials (OPTIONAL - can skip)
- [ ] Stripe webhook secret (OPTIONAL - for payment testing)

### Once Service Role Key is Added:

```bash
# Test the build
npm run build

# Start development server
npm run dev
```

Visit http://localhost:3000

---

## 🔐 Security Checklist

⚠️ **IMPORTANT - These are TEST credentials. For production:**

1. **Never commit `.env.local` to git** (already in .gitignore)
2. **Switch to production API keys** when deploying:
   - Stripe: Use `pk_live_...` and `sk_live_...`
   - Supabase: Use production project
   - OpenAI: Consider rate limits and usage
3. **Add environment variables to Vercel**:
   - Dashboard → Settings → Environment Variables
4. **Enable RLS in production Supabase**
5. **Rotate any keys shared publicly** (especially the OpenAI key you shared)

---

## 📊 Testing Your Setup

### Test 1: Database Connection
```bash
# In your browser dev tools console after running npm run dev:
fetch('/api/users/me', {
  headers: { 'Authorization': 'Bearer YOUR_JWT_TOKEN' }
})
```

### Test 2: Stripe Integration
```bash
# Create a test payment (requires a test order)
# See API documentation in README.md
```

### Test 3: AI Features
```bash
# Test intent classification
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"text": "I need to shorten my trousers"}'
```

---

## ❓ What You Shared & What's Needed

| Service | What You Provided | What's Missing | Priority |
|---------|------------------|----------------|----------|
| **Stripe** | ✅ Test keys | Webhook secret (for testing) | Medium |
| **Supabase** | ✅ URL + Anon Key | ⚠️ Service Role Key | **HIGH** |
| **Supabase DB** | ❌ Not set up | Need to run migrations | **HIGH** |
| **OpenAI** | ✅ API Key | Nothing | ✅ Done |
| **Twilio** | ❌ Not provided | Account SID, Auth Token, Number | Low |
| **App Config** | ❌ Not set | NEXT_PUBLIC_SITE_URL (use localhost) | Medium |

---

## 🚀 Next Steps (Priority Order)

1. **Get Supabase Service Role Key** ⭐ CRITICAL
2. **Run database migrations** ⭐ CRITICAL
3. **Test build and dev server**
4. **Optional: Setup Twilio for WhatsApp**
5. **Optional: Setup Stripe webhooks for payment testing**

---

## 📞 Need Help?

Common issues:
- **Build fails**: Check all environment variables are set
- **Database errors**: Ensure migrations ran successfully
- **Auth errors**: Verify Supabase keys are correct
- **Payment errors**: Check Stripe keys and webhook setup

Ready to continue? Get your Supabase Service Role Key and let me know!
