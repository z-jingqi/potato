import type { Collection, Record, Prisma } from "@potato/database-charts";

// API Request Types
export interface CreateCollectionRequest {
  name: string;
  description?: string;
  icon?: string;
  dateDimensions?: "year" | "month" | "day" | "time";
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  icon?: string;
  dateDimensions?: "year" | "month" | "day" | "time";
}

export interface CreateRecordRequest {
  recordDate: string | Date;
  data: string;
}

export interface UpdateRecordRequest {
  recordDate?: string | Date;
  data?: string;
}

// API Response Types
export interface ApiError {
  error: string;
}

// Use Prisma generated types for responses
export type CollectionWithRecords = Prisma.CollectionGetPayload<{
  include: { records: true };
}>;

export type CollectionWithCount = Prisma.CollectionGetPayload<{
  include: { _count: { select: { records: true } } };
}>;

export interface CollectionResponse {
  collection: CollectionWithRecords;
}

export interface CollectionsResponse {
  collections: CollectionWithCount[];
}

export interface RecordResponse {
  record: Record;
}

export interface SuccessResponse {
  success: boolean;
}
