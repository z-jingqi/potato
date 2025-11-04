import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { AIConfig } from "../config";

/**
 * Create OpenRouter provider instance
 */
export function createOpenRouterProvider(config: AIConfig["openrouter"]) {
  if (!config.apiKey) {
    throw new Error("OpenRouter API key is required");
  }

  return createOpenRouter({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });
}
