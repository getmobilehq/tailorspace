import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const intentSchema = z.object({
  text: z.string(),
  order_id: z.string().uuid().optional(),
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
    const validatedData = intentSchema.parse(body);

    const prompt = `Classify this tailoring request: "${validatedData.text}".
Return JSON with: garment_type (string), alteration_type (string), urgency (low/medium/high).
Examples:
- "shorten my trousers" -> {"garment_type": "trousers", "alteration_type": "hem_shortening", "urgency": "medium"}
- "fix a tear in my jacket urgently" -> {"garment_type": "jacket", "alteration_type": "repair", "urgency": "high"}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a tailoring assistant that classifies customer requests.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const intent = JSON.parse(completion.choices[0].message.content || '{}');

    // Update or create AI metadata
    if (validatedData.order_id) {
      await supabaseAdmin
        .from('ai_metadata')
        .upsert([
          {
            order_id: validatedData.order_id,
            intent: intent.alteration_type,
            confidence: 0.95,
            garment_type_detected: intent.garment_type,
            alteration_type_detected: intent.alteration_type,
            urgency: intent.urgency,
            processed_at: new Date().toISOString(),
          },
        ]);

      // Log AI intent detection
      await supabaseAdmin.from('event_logs').insert([
        {
          event_name: 'ai_intent_detected',
          user_id: user.id,
          order_id: validatedData.order_id,
          properties: { intent: intent.alteration_type },
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      data: intent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Intent classification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
