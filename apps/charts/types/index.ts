import { Chart, Category, DataPoint } from "@potato/database-charts";

// Extended types for API responses
export type ChartWithData = Chart & {
  dataPoints?: DataPoint[];
  category?: Category | null;
};

export type ChartFormData = {
  name: string;
  description?: string;
  categoryId?: string;
  chartType: "trend" | "record";
  valueType: "number" | "text" | "boolean";
  unit?: string;
  visualizationType?: "line" | "bar" | "area";
};

export type DataPointFormData = {
  timestamp: Date;
  valueNumber?: number;
  valueText?: string;
  valueBoolean?: boolean;
  notes?: string;
};

export type CategoryFormData = {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
};
