import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const feedbackSchema = z.object({
  order_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
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
    const validatedData = feedbackSchema.parse(body);

    // Create feedback
    const { data: feedback, error: feedbackError } = await supabaseAdmin
      .from('feedback')
      .insert([
        {
          order_id: validatedData.order_id,
          user_id: user.id,
          rating: validatedData.rating,
          comment: validatedData.comment,
        },
      ])
      .select()
      .single();

    if (feedbackError) {
      return NextResponse.json(
        { success: false, message: feedbackError.message },
        { status: 500 }
      );
    }

    // Log feedback event
    await supabaseAdmin.from('event_logs').insert([
      {
        event_name: 'feedback_submitted',
        user_id: user.id,
        order_id: validatedData.order_id,
        properties: { rating: validatedData.rating },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Submit feedback error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'order_id required' },
        { status: 400 }
      );
    }

    const { data: feedback, error: feedbackError } = await supabase
      .from('feedback')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (feedbackError) {
      return NextResponse.json(
        { success: false, message: 'Feedback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
