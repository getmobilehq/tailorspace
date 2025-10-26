import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { supabaseAdmin } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    const formData = await req.formData();
    const voiceFile = formData.get('voice') as File;
    const orderId = formData.get('order_id') as string;

    if (!voiceFile) {
      return NextResponse.json(
        { success: false, message: 'Voice file required' },
        { status: 400 }
      );
    }

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: voiceFile,
      model: 'whisper-1',
    });

    // Store transcription in AI metadata
    const { data: aiMetadata, error: aiError } = await supabaseAdmin
      .from('ai_metadata')
      .upsert([
        {
          order_id: orderId,
          voice_text: transcription.text,
          processed_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (aiError) {
      return NextResponse.json(
        { success: false, message: aiError.message },
        { status: 500 }
      );
    }

    // Log AI transcription event
    await supabaseAdmin.from('event_logs').insert([
      {
        event_name: 'ai_transcription_created',
        user_id: user.id,
        order_id: orderId,
        properties: { text_length: transcription.text.length },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        text: transcription.text,
        metadata_id: aiMetadata.id,
      },
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
