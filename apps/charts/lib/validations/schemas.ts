import { z } from "zod";

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  icon: z.string().max(50).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Chart schemas
export const createChartSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  chartType: z.enum(["trend", "record"]),
  valueType: z.enum(["number", "text", "boolean"]),
  unit: z.string().max(50).optional(),
  visualizationType: z.enum(["line", "bar", "area"]).optional(),
});

export const updateChartSchema = createChartSchema.partial();

// Data point schemas
export const createDataPointSchema = z.object({
  timestamp: z.coerce.date(),
  valueNumber: z.number().optional(),
  valueText: z.string().max(1000).optional(),
  valueBoolean: z.boolean().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateDataPointSchema = createDataPointSchema.partial();
