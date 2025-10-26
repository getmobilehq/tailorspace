import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Supabase Test (POST) ===');

    // Parse request body like login does
    const body = await req.json();
    console.log('Body received:', body);

    const testEmail = body.email || 'customer@tailorspace.co.uk';

    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Service Key length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length);

    // Test 1: Check if client was created
    console.log('Test 1: Client created:', !!supabaseAdmin);

    // Test 2: Query with exact login pattern
    console.log('Test 2: Attempting exact login query pattern with email:', testEmail);
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (error) {
      console.error('Query error:', error);
      return NextResponse.json({
        success: false,
        test: 'query',
        error: error.message,
        details: error,
      });
    }

    console.log('Query successful, data:', data);

    return NextResponse.json({
      success: true,
      message: 'Supabase connection working',
      data,
    });
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      message: error.message,
      stack: error.stack,
      name: error.name,
    }, { status: 500 });
  }
}
