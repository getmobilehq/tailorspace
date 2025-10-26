import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendWhatsAppMessage } from '@/lib/twilio';
import { z } from 'zod';

const sendNotificationSchema = z.object({
  recipient_id: z.string().uuid(),
  order_id: z.string().uuid().optional(),
  channel: z.enum(['whatsapp', 'email', 'sms']),
  message: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = sendNotificationSchema.parse(body);

    // Get recipient details
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('phone, email')
      .eq('id', validatedData.recipient_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: 'Recipient not found' },
        { status: 404 }
      );
    }

    let externalId = '';
    let sendResult;

    // Send based on channel
    if (validatedData.channel === 'whatsapp' && user.phone) {
      sendResult = await sendWhatsAppMessage(user.phone, validatedData.message);
      externalId = sendResult.sid || '';
    }

    // Create notification record
    const { data: notification, error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert([
        {
          recipient_id: validatedData.recipient_id,
          order_id: validatedData.order_id,
          channel: validatedData.channel,
          message: validatedData.message,
          status: sendResult?.success ? 'sent' : 'failed',
          external_id: externalId,
          sent_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (notificationError) {
      return NextResponse.json(
        { success: false, message: notificationError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: 'Notification sent successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Send notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
