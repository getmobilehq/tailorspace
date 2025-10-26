# Login Endpoint Issue

## Problem
The login endpoint is experiencing a persistent JSON parsing error when making Supabase API calls.

**Error:**
```
SyntaxError: Bad escaped character in JSON at position 62 (line 1 column 63)
  at JSON.parse (<anonymous>)
  at parseJSONFromBytes (node:internal/deps/undici/undici:5738:19)
```

## Error Location
- Happening in Supabase's internal HTTP client (undici)
- Occurs when Supabase tries to parse JSON responses from the Supabase API
- Affects BOTH login and signup endpoints

## What We've Tried

1. ✅ **Fixed RLS policy blocking** - Changed to use `supabaseAdmin` instead of `supabase` client
2. ✅ **Created separate server client** - Added `supabaseServer` with anon key for auth
3. ✅ **Simplified login logic** - Removed `signInWithPassword`, just query users table
4. ✅ **Removed auth.admin calls** - Eliminated `admin.listUsers()` that might cause issues
5. ❌ **All attempts still fail** with same JSON parsing error

## Current Status
- **Signup**: Previously worked (user created successfully), now failing
- **Login**: Never worked, same error
- **Server Port**: Changed to 5001 (5000 used by macOS ControlCenter)

## Possible Causes
1. Supabase Service Role Key may have an issue (position 62 suggests specific character)
2. Supabase URL configuration problem
3. Supabase API returning malformed JSON (database not set up correctly?)
4. Environment variable loading issue in production mode

## Next Steps
1. Verify database tables exist in Supabase dashboard
2. Test Supabase connection directly in browser/Postman
3. Check Supabase logs for errors
4. Try regenerating Service Role Key if needed
5. Consider using Supabase Auth UI on frontend instead of API-based auth

## Workaround
Since signup previously worked, the database connection is functional. The issue appears to be specifically with how auth operations are being handled server-side.

**Recommended approach:**
- Move authentication to client-side using Supabase Auth UI
- Keep API routes for data operations only
- Use Supabase session tokens for authorization

## Files Affected
- `app/api/auth/login/route.ts`
- `app/api/auth/signup/route.ts`
- `lib/supabase/server.ts`
