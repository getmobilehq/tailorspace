# 🗄️ Database Setup Instructions

## ✅ Step 1: Run Database Migrations

You need to create the database tables in your Supabase project.

### Method 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase SQL Editor:**
   - Visit: https://supabase.com/dashboard/project/cviuuxbngfagwrclgeev/sql
   - Or: Dashboard → SQL Editor → New Query

2. **Run First Migration (Schema):**
   - Open file: `db/migrations/001_comprehensive_schema.sql`
   - Copy **ALL** contents (it's long - 200+ lines)
   - Paste into SQL Editor
   - Click **Run** (bottom right green button)
   - ✅ You should see: "Success. No rows returned"

3. **Run Second Migration (RLS Policies):**
   - Open file: `db/migrations/002_rls_policies.sql`
   - Copy **ALL** contents
   - Paste into SQL Editor
   - Click **Run**
   - ✅ You should see: "Success. No rows returned"

### Method 2: Via Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref cviuuxbngfagwrclgeev

# Run migrations
supabase db push
```

---

## ✅ Step 2: Create Storage Buckets

These store uploaded files (photos, voice notes).

1. **Go to Storage:**
   - Visit: https://supabase.com/dashboard/project/cviuuxbngfagwrclgeev/storage/buckets
   - Or: Dashboard → Storage → Buckets

2. **Create Three Buckets:**

   **Bucket 1: order_photos**
   - Click **New bucket**
   - Name: `order_photos`
   - Public: ❌ **No** (Private)
   - Click **Create**

   **Bucket 2: voice_notes**
   - Name: `voice_notes`
   - Public: ❌ **No** (Private)
   - Click **Create**

   **Bucket 3: profile_photos**
   - Name: `profile_photos`
   - Public: ❌ **No** (Private)
   - Click **Create**

---

## ✅ Step 3: Verify Tables Were Created

1. **Go to Table Editor:**
   - Visit: https://supabase.com/dashboard/project/cviuuxbngfagwrclgeev/editor
   - Or: Dashboard → Table Editor

2. **Check You See These Tables:**
   - ✅ users
   - ✅ services
   - ✅ orders
   - ✅ payments
   - ✅ feedback
   - ✅ notifications
   - ✅ runner_assignments
   - ✅ ai_metadata
   - ✅ support_sessions
   - ✅ event_logs

If you see all 10 tables, you're done! ✅

---

## ✅ Step 4: Add Sample Service (Optional)

To test orders, add a sample alteration service:

1. Go to **Table Editor** → **services** table
2. Click **Insert** → **Insert row**
3. Fill in:
   - **name**: "Trouser Hemming"
   - **description**: "Shorten or lengthen trouser legs"
   - **category**: "alterations"
   - **base_price**: 15.00
   - **garment_type**: "trousers"
   - **is_active**: true
4. Click **Save**

---

## 🧪 Test Your Setup

Once migrations are complete, test the API:

### Test 1: Create a User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tailorspace.co.uk",
    "password": "SecurePass123!",
    "full_name": "John Smith",
    "phone": "+447700900123",
    "role": "customer"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@tailorspace.co.uk",
    "full_name": "John Smith",
    "role": "customer"
  },
  "message": "User created successfully"
}
```

### Test 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@tailorspace.co.uk",
    "password": "SecurePass123!"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "session": {
      "access_token": "eyJhbGci...",
      ...
    }
  },
  "message": "Login successful"
}
```

### Test 3: AI Intent Classification

```bash
# Replace YOUR_ACCESS_TOKEN with the access_token from login response
curl -X POST http://localhost:3000/api/ai/intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "text": "I need to shorten my trousers by 2 inches"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "garment_type": "trousers",
    "alteration_type": "hem_shortening",
    "urgency": "medium"
  }
}
```

---

## ❌ Troubleshooting

### Error: "relation 'users' does not exist"
- ❌ Migrations haven't run
- ✅ Run `001_comprehensive_schema.sql` in SQL Editor

### Error: "new row violates row-level security policy"
- ❌ RLS policies not applied
- ✅ Run `002_rls_policies.sql` in SQL Editor

### Error: "duplicate key value violates unique constraint"
- ❌ Trying to create user with existing email
- ✅ Use a different email or check Table Editor → users

### Can't Upload Files
- ❌ Storage buckets not created
- ✅ Create buckets in Storage section

---

## 📊 What Each Migration Does

### 001_comprehensive_schema.sql
Creates:
- ✅ All 10 database tables
- ✅ Indexes for performance
- ✅ Timestamp triggers
- ✅ UUID extension
- ✅ Constraints and relationships

### 002_rls_policies.sql
Secures data:
- ✅ Enables Row Level Security (RLS)
- ✅ Customer policies (view own data)
- ✅ Tailor policies (view assigned orders)
- ✅ Runner policies (view deliveries)
- ✅ Admin policies (full access)

---

## ✅ Completion Checklist

- [ ] Ran `001_comprehensive_schema.sql`
- [ ] Ran `002_rls_policies.sql`
- [ ] Created 3 storage buckets
- [ ] Verified all 10 tables exist
- [ ] Added sample service (optional)
- [ ] Tested signup API
- [ ] Tested login API
- [ ] Tested AI intent API

**Once all checked, your database is ready!** ✅
