import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createAIClient, AI_MODELS } from '@potato/ai';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { message?: string; model?: string };
    const { message, model = AI_MODELS.CLAUDE_SONNET } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const aiClient = createAIClient({ apiKey });

    const response = await aiClient.chat({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that helps analyze chart data and provide insights.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
