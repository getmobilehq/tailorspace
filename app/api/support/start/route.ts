import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const startSupportSchema = z.object({
  order_id: z.string().uuid().optional(),
  channel: z.enum(['whatsapp', 'email', 'chat']).default('whatsapp'),
});

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = startSupportSchema.parse(body);

    // Create support session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('support_sessions')
      .insert([
        {
          user_id: user.id,
          order_id: validatedData.order_id,
          channel: validatedData.channel,
          status: 'active',
          interaction_count: 0,
          last_interaction: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json(
        { success: false, message: sessionError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Support session started',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Start support error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
