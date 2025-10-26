import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { sendWhatsAppMessage } from '@/lib/twilio';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const messageSchema = z.object({
  from: z.string(),
  body: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = messageSchema.parse(body);

    // Find user by phone
    const phoneClean = validatedData.from.replace('whatsapp:', '');
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phoneClean)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `You are TailorSpace Support Assistant. Help customers with:
- Order tracking
- Alteration questions
- Pickup/delivery scheduling
- General inquiries
Be friendly, concise, and helpful. If you can't help, suggest they visit the website or contact an agent.`,
        },
        { role: 'user', content: validatedData.body },
      ],
    });

    const reply = completion.choices[0].message.content || 'Sorry, I couldn\'t process that. Please contact our support team.';

    // Send WhatsApp reply
    await sendWhatsAppMessage(phoneClean, reply);

    // Update support session
    const { data: session } = await supabaseAdmin
      .from('support_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (session) {
      await supabaseAdmin
        .from('support_sessions')
        .update({
          interaction_count: (session.interaction_count || 0) + 1,
          last_interaction: new Date().toISOString(),
        })
        .eq('id', session.id);
    }

    // Log AI support event
    await supabaseAdmin.from('event_logs').insert([
      {
        event_name: 'ai_support_reply',
        user_id: user.id,
        properties: {
          message_length: reply.length,
          user_message: validatedData.body,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Support message error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
