import type { Message } from "@potato/database-diet";
import type { UIMessage } from "ai";
import { ChatMessageMetadata } from "../../types/chat";

/**
 * Convert a Prisma Message to AI SDK UIMessage format
 */
export function prismaMessageToUIMessage(message: Message): UIMessage {
  return {
    id: message.id,
    role: message.role as "system" | "user" | "assistant",
    parts: message.parts as any, // Parts are already in the correct format (stored as Json)
    metadata: message.metadata as any,
  };
}

/**
 * Convert AI SDK UIMessage to Prisma Message data format
 */
export function uiMessageToPrismaData(message: UIMessage) {
  return {
    id: message.id,
    role: message.role,
    parts: message.parts as any,
    metadata: message.metadata as any,
  };
}

/**
 * Helper to extract plain text content from UIMessage parts
 * Useful for backwards compatibility or when you need simple text
 */
export function extractTextFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => ("text" in part ? part.text : ""))
    .join("");
}

/**
 * Helper to create a simple text UIMessage
 * Useful when creating new messages programmatically
 */
export function createTextUIMessage(
  id: string,
  role: "system" | "user" | "assistant",
  text: string,
  metadata?: ChatMessageMetadata
): UIMessage<ChatMessageMetadata> {
  return {
    id,
    role,
    parts: [{ type: "text", text }],
    metadata,
  };
}
