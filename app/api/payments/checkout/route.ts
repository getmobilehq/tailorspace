import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const checkoutSchema = z.object({
  order_id: z.string().uuid(),
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
    const validatedData = checkoutSchema.parse(body);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, services(name)')
      .eq('id', validatedData.order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify order belongs to user
    if (order.customer_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}/cancel`,
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            unit_amount: Math.round(order.price * 100),
            product_data: {
              name: `TailorSpace - ${order.services?.name || 'Alteration'}`,
              description: order.description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: order.id,
        user_id: user.id,
      },
    });

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert([
        {
          order_id: order.id,
          amount: order.price,
          currency: 'GBP',
          status: 'pending',
          stripe_session_id: session.id,
          metadata: { checkout_url: session.url },
        },
      ])
      .select()
      .single();

    if (paymentError) {
      return NextResponse.json(
        { success: false, message: paymentError.message },
        { status: 500 }
      );
    }

    // Log payment initiation
    await supabaseAdmin.from('event_logs').insert([
      {
        event_name: 'payment_initiated',
        user_id: user.id,
        order_id: order.id,
        properties: { amount: order.price },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        session_id: session.id,
        checkout_url: session.url,
        payment_id: payment.id,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
