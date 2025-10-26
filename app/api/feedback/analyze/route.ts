import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeSchema = z.object({
  feedback_id: z.string().uuid(),
  text: z.string(),
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
    const validatedData = analyzeSchema.parse(body);

    const prompt = `Analyze the sentiment of this feedback: "${validatedData.text}".
Return one word: positive, neutral, or negative.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'You are a sentiment analysis assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    const sentiment = completion.choices[0].message.content?.trim().toLowerCase() || 'neutral';
    const sentimentScore = sentiment === 'positive' ? 1 : sentiment === 'negative' ? -1 : 0;

    // Update feedback with sentiment
    const { data: feedback, error: feedbackError } = await supabaseAdmin
      .from('feedback')
      .update({ sentiment_score: sentimentScore })
      .eq('id', validatedData.feedback_id)
      .select()
      .single();

    if (feedbackError) {
      return NextResponse.json(
        { success: false, message: feedbackError.message },
        { status: 500 }
      );
    }

    // Log sentiment analysis
    await supabaseAdmin.from('event_logs').insert([
      {
        event_name: 'ai_feedback_sentiment',
        user_id: user.id,
        properties: { sentiment, sentiment_score: sentimentScore },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        sentiment,
        sentiment_score: sentimentScore,
        feedback,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Sentiment analysis error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
