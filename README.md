# TailorSpace MVP

A UK-based alterations & tailoring marketplace offering pickup and delivery services. Built with Next.js 14, Supabase, Stripe, and AI integration.

## 🎯 Project Overview

**Core Vision:** "Make alterations as simple as ordering a ride — while empowering local tailors to thrive digitally."

**MVP Features:**
- Customer booking system (single/multiple garments)
- Stripe payment integration (upfront payments)
- WhatsApp automation & support
- AI-powered voice transcription & intent classification
- Tailor & runner dashboards
- Admin control panel
- Real-time order tracking

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, ShadCN UI
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth with RLS
- **Payments:** Stripe
- **Messaging:** Twilio WhatsApp API
- **AI:** OpenAI Whisper + GPT-4-Turbo
- **Deployment:** Vercel

## 📦 Project Structure

```
tailorspace/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── orders/            # Order management
│   │   ├── payments/          # Stripe integration
│   │   ├── notifications/     # WhatsApp & notifications
│   │   ├── feedback/          # Customer feedback
│   │   ├── support/           # Support sessions
│   │   ├── admin/             # Admin endpoints
│   │   └── ai/                # AI endpoints (Whisper, GPT)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/                    # ShadCN components
├── lib/
│   ├── supabase/              # Supabase clients
│   ├── twilio.ts              # WhatsApp integration
│   ├── constants.ts           # App constants
│   └── utils.ts               # Utility functions
├── db/
│   └── migrations/            # Database schemas
└── .env.example

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account
- Twilio account (WhatsApp Business API)
- OpenAI API key

### 1. Clone & Install

```bash
cd tailorspace
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_pk
STRIPE_SECRET_KEY=your_stripe_sk
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+your_number

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration files in order:

```bash
# In Supabase SQL Editor, run:
# 1. db/migrations/001_comprehensive_schema.sql
# 2. db/migrations/002_rls_policies.sql
```

3. Create storage buckets:
   - `order_photos`
   - `voice_notes`
   - `profile_photos`

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders (role-based)
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order
- `DELETE /api/orders/[id]` - Cancel order

### Payments
- `POST /api/payments/checkout` - Create Stripe session
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/[order_id]` - Get payment details

### Notifications
- `POST /api/notifications/send` - Send WhatsApp/email

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback?order_id=` - Get feedback
- `POST /api/feedback/analyze` - AI sentiment analysis

### Support
- `POST /api/support/start` - Start support session
- `POST /api/support/message` - AI-powered support

### AI
- `POST /api/ai/transcribe` - Voice to text (Whisper)
- `POST /api/ai/intent` - Intent classification (GPT-4)

### Admin
- `GET /api/admin/metrics` - Dashboard metrics

## 🗄️ Database Schema

### Core Tables

- **users** - All platform users (customers, tailors, runners, admins)
- **services** - Alteration service catalog
- **orders** - Customer orders with status tracking
- **payments** - Stripe payment records
- **feedback** - Customer feedback with sentiment analysis
- **notifications** - WhatsApp/email message log
- **runner_assignments** - Pickup/delivery assignments
- **ai_metadata** - AI-processed data (transcripts, intents)
- **support_sessions** - Customer support sessions
- **event_logs** - Analytics and audit trail

### User Roles

- **customer** - Can create/view own orders
- **tailor** - Can view assigned orders, update status
- **runner** - Can view assigned pickups/deliveries
- **admin** - Manage services, users, payments
- **super_admin** - Full system access

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication via Supabase
- Role-based access control
- Stripe webhook signature verification
- Environment variables for sensitive data

## 🧪 Testing

```bash
npm run test        # Run tests (to be implemented)
npm run lint        # Run ESLint
npm run build       # Production build
```

## 📱 WhatsApp Integration

WhatsApp messages are sent for:
- Welcome message on signup
- Order confirmation
- Status updates
- Delivery confirmation
- Support requests (AI-powered replies)

## 🤖 AI Features

1. **Voice Transcription** - Convert voice notes to text using Whisper
2. **Intent Classification** - Detect garment type, alteration type, urgency
3. **Smart Support** - AI-powered WhatsApp support bot
4. **Sentiment Analysis** - Analyze customer feedback sentiment

## 📊 Monitoring

Event logging is implemented for:
- User signup/login
- Order creation/updates
- Payment completion
- AI operations
- Support interactions

Query admin metrics:
```bash
GET /api/admin/metrics
```

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy

```bash
vercel --prod
```

### Supabase Setup

```bash
# Install Supabase CLI
npm i -g supabase

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## 📄 License

Private - TailorSpace MVP

## 🤝 Support

For issues or questions, contact the development team.

---

Built with ❤️ for TailorSpace
