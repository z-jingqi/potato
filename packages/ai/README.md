# @potato/ai

Shared AI utilities for OpenRouter and Vercel AI SDK integration across potato apps.

## Features

- 🤖 OpenRouter provider configuration
- 📡 Streaming and non-streaming chat completions
- ⚙️ Centralized AI configuration
- 🔄 Easy to use with Vercel AI SDK

## Installation

This package is already included in both diet and charts apps via workspace dependency.

## Environment Variables

Required environment variables (add to `.env.local`):

```env
OPENROUTER_API_KEY="your-api-key-here"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
OPENROUTER_DEFAULT_MODEL="openai/gpt-4o-mini"
OPENROUTER_RECIPE_MODEL="openai/gpt-4o-mini"
```

## Usage

### Basic Streaming Chat

```typescript
import { createStreamingResponse } from "@potato/ai";

export async function POST(request: Request) {
  const { messages } = await request.json();

  return createStreamingResponse({
    messages,
    system: "You are a helpful assistant.",
  });
}
```

### Advanced Usage

```typescript
import { streamChatCompletion, AI_CONFIG } from "@potato/ai";

// Stream with custom options
const result = await streamChatCompletion({
  messages,
  model: AI_CONFIG.openrouter.defaultModel,
  system: "You are a helpful assistant.",
  temperature: 0.7,
  maxTokens: 2000,
});

// Convert to UI Message stream
return result.toUIMessageStreamResponse();
```

### Non-Streaming Generation

```typescript
import { generateChatCompletion } from "@potato/ai";

const result = await generateChatCompletion({
  messages: [{ role: "user", content: "Hello!" }],
  system: "You are a helpful assistant.",
});

console.log(result.text);
```

### Custom Provider Configuration

```typescript
import { createOpenRouterProvider, createAIConfig } from "@potato/ai";

// Create custom config
const customConfig = createAIConfig({
  OPENROUTER_API_KEY: "custom-key",
  OPENROUTER_DEFAULT_MODEL: "anthropic/claude-3-sonnet",
});

// Create provider
const provider = createOpenRouterProvider(customConfig.openrouter);
```

## Architecture

### Files

- **`src/config.ts`** - AI configuration management
- **`src/providers/openrouter.ts`** - OpenRouter provider setup
- **`src/helpers.ts`** - Convenience functions for common tasks
- **`src/index.ts`** - Main exports

### Configuration Flow

1. Environment variables are loaded from `.env.local`
2. `AI_CONFIG` is created automatically on import
3. Helper functions use `AI_CONFIG` by default
4. Custom configs can be created for specific use cases

## Examples

### Diet App - Chat Handler

```typescript
import { createStreamingResponse } from "@potato/ai";

export async function handleChatRequest(request: Request) {
  const { messages } = await request.json();

  return createStreamingResponse({
    messages,
    system: "You are DietAI, a friendly cooking assistant.",
  });
}
```

### Charts App - Future AI Feature

```typescript
import { generateChatCompletion, AI_CONFIG } from "@potato/ai";

export async function POST(request: Request) {
  const { chartData } = await request.json();

  const result = await generateChatCompletion({
    messages: [
      {
        role: "user",
        content: `Analyze this chart data: ${JSON.stringify(chartData)}`,
      },
    ],
    system: "You are a data analysis assistant.",
    model: AI_CONFIG.openrouter.defaultModel,
  });

  return Response.json({ analysis: result.text });
}
```

## Benefits

✅ **Shared Configuration** - Single source of truth for AI settings
✅ **Type Safe** - Full TypeScript support
✅ **Easy Integration** - Works seamlessly with Vercel AI SDK
✅ **Flexible** - Supports both streaming and non-streaming
✅ **Maintainable** - Update AI logic once, affects both apps

## Future Enhancements

- Support for multiple AI providers (OpenAI, Anthropic, etc.)
- Built-in rate limiting and retry logic
- Cost tracking and usage analytics
- Prompt template management
