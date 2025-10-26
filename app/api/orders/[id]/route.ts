import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const updateOrderSchema = z.object({
  status: z.enum(['pending', 'picked_up', 'in_tailoring', 'ready', 'out_for_delivery', 'delivered', 'cancelled']).optional(),
  tailor_id: z.string().uuid().optional(),
  delivery_datetime: z.string().optional(),
});

// Get single order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, services(name, description), users!customer_id(full_name, email, phone)')
      .eq('id', params.id)
      .single();

    if (orderError) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update order
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateOrderSchema.parse(body);

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { success: false, message: orderError.message },
        { status: 500 }
      );
    }

    // Log status update event
    if (validatedData.status) {
      await supabaseAdmin.from('event_logs').insert([
        {
          event_name: 'order_status_updated',
          user_id: user.id,
          order_id: order.id,
          properties: { new_status: validatedData.status },
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Update order error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete/Cancel order
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Mark as cancelled instead of deleting
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', params.id)
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { success: false, message: orderError.message },
        { status: 500 }
      );
    }

    // Log cancellation event
    await supabaseAdmin.from('event_logs').insert([
      {
        event_name: 'order_cancelled',
        user_id: user.id,
        order_id: order.id,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
