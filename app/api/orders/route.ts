import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import { z } from 'zod';

const createOrderSchema = z.object({
  service_id: z.string().uuid(),
  description: z.string(),
  garment_type: z.string(),
  photo_urls: z.array(z.string()).optional(),
  voice_note_url: z.string().optional(),
  price: z.number().positive(),
  pickup_address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    postcode: z.string(),
  }),
  pickup_datetime: z.string(),
  special_instructions: z.string().optional(),
});

// Create new order
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
    const validatedData = createOrderSchema.parse(body);

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          customer_id: user.id,
          service_id: validatedData.service_id,
          description: validatedData.description,
          garment_type: validatedData.garment_type,
          photo_urls: validatedData.photo_urls,
          voice_note_url: validatedData.voice_note_url,
          price: validatedData.price,
          pickup_address: validatedData.pickup_address,
          pickup_datetime: validatedData.pickup_datetime,
          special_instructions: validatedData.special_instructions,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { success: false, message: orderError.message },
        { status: 500 }
      );
    }

    // Log order creation event
    await supabaseAdmin.from('event_logs').insert([
      {
        event_name: 'order_created',
        user_id: user.id,
        order_id: order.id,
        properties: { price: validatedData.price, garment_type: validatedData.garment_type },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get orders (customer's own orders)
export async function GET(req: NextRequest) {
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

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    let query = supabase.from('orders').select('*, services(name), users!customer_id(full_name, email)');

    // Filter based on role
    if (userData?.role === 'customer') {
      query = query.eq('customer_id', user.id);
    } else if (userData?.role === 'tailor') {
      query = query.eq('tailor_id', user.id);
    } else if (userData?.role === 'admin' || userData?.role === 'super_admin') {
      // Admins can see all orders
    } else {
      query = query.eq('customer_id', user.id);
    }

    const { data: orders, error: ordersError } = await query.order('created_at', { ascending: false });

    if (ordersError) {
      return NextResponse.json(
        { success: false, message: ordersError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
