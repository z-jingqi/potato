import {
  convertToModelMessages,
  streamText,
  generateText,
  UIMessage,
} from "ai";
import { createOpenRouterProvider } from "./providers/openrouter";
import { AI_CONFIG } from "./config";

/**
 * Stream chat completion with OpenRouter
 */
export async function streamChatCompletion(options: {
  messages: UIMessage[];
  model?: string;
  system?: string;
  temperature?: number;
}) {
  const provider = createOpenRouterProvider(AI_CONFIG.openrouter);
  const model = options.model ?? AI_CONFIG.openrouter.defaultModel;

  const result = streamText({
    model: provider.chat(model),
    messages: convertToModelMessages(options.messages),
    system: options.system,
    temperature: options.temperature,
  });

  return result;
}

/**
 * Generate chat completion with OpenRouter (non-streaming)
 */
export async function generateChatCompletion(options: {
  messages: UIMessage[];
  model?: string;
  system?: string;
  temperature?: number;
}) {
  const provider = createOpenRouterProvider(AI_CONFIG.openrouter);
  const model = options.model ?? AI_CONFIG.openrouter.defaultModel;

  const result = await generateText({
    model: provider.chat(model),
    messages: convertToModelMessages(options.messages),
    system: options.system,
    temperature: options.temperature,
  });

  return result;
}

/**
 * Create a streaming response suitable for Next.js API routes
 */
export async function createStreamingResponse(options: {
  messages: UIMessage[];
  model?: string;
  system?: string;
  temperature?: number;
}): Promise<Response> {
  const result = await streamChatCompletion(options);
  return result.toUIMessageStreamResponse();
}
