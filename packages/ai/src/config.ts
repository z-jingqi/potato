/**
 * Shared AI Configuration
 * Used by both diet and charts apps
 */

export interface AIConfig {
  openrouter: {
    apiKey: string | undefined;
    baseUrl: string;
    defaultModel: string;
    recipeModel: string;
  };
}

/**
 * Create AI configuration from environment variables
 */
export function createAIConfig(env?: Record<string, string | undefined>): AIConfig {
  const getEnv = (key: string) => env?.[key] ?? process.env[key];

  return {
    openrouter: {
      apiKey: getEnv("OPENROUTER_API_KEY"),
      baseUrl: getEnv("OPENROUTER_BASE_URL") ?? "https://openrouter.ai/api/v1",
      defaultModel: getEnv("OPENROUTER_DEFAULT_MODEL") ?? "openai/gpt-4o-mini",
      recipeModel: getEnv("OPENROUTER_RECIPE_MODEL") ?? "openai/gpt-4o-mini",
    },
  };
}

/**
 * Validate that required AI configuration is present
 */
export function validateAIConfig(config: AIConfig): void {
  if (!config.openrouter.apiKey) {
    throw new Error(
      "Missing OPENROUTER_API_KEY environment variable. Please set it in your .env.local file."
    );
  }
}

/**
 * Default AI configuration instance
 */
export const AI_CONFIG = createAIConfig();
