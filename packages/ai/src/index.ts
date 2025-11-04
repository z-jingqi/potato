/**
 * @potato/ai
 * Shared AI utilities for OpenRouter and Vercel AI SDK
 */

// Configuration
export {
  AI_CONFIG,
  createAIConfig,
  validateAIConfig,
  type AIConfig,
} from "./config";

// Providers
export { createOpenRouterProvider } from "./providers/openrouter";

// Helper functions
export {
  streamChatCompletion,
  generateChatCompletion,
  createStreamingResponse,
} from "./helpers";

// Re-export commonly used AI SDK types and functions
export type { LanguageModel, CoreMessage, UIMessage } from "ai";
export { convertToModelMessages, streamText, generateText } from "ai";
