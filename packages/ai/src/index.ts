import OpenAI from 'openai';

export interface AIConfig {
  apiKey: string;
  baseURL?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export class AIClient {
  private client: OpenAI;

  constructor(config: AIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://openrouter.ai/api/v1',
    });
  }

  async chat(options: ChatOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  }

  async streamChat(options: ChatOptions) {
    const stream = await this.client.chat.completions.create({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: true,
    });

    return stream;
  }
}

export function createAIClient(config: AIConfig): AIClient {
  return new AIClient(config);
}

// Common models available on OpenRouter
export const AI_MODELS = {
  CLAUDE_SONNET: 'anthropic/claude-3.5-sonnet',
  CLAUDE_HAIKU: 'anthropic/claude-3-haiku',
  GPT4: 'openai/gpt-4-turbo',
  GPT4_MINI: 'openai/gpt-4o-mini',
  GEMINI_PRO: 'google/gemini-pro-1.5',
} as const;
