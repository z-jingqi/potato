import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DEFAULT_CHART_COLOR } from "@/lib/constants";
import type { ChartWithData } from "@/types";

interface ChartVisualizationProps {
  chart: ChartWithData;
  chartData: Array<{
    timestamp: number;
    date: string;
    value: number;
    text?: string | null;
    boolean?: boolean | null;
  }>;
}

export function ChartVisualization({ chart, chartData }: ChartVisualizationProps) {
  // Don't render chart for non-trend or non-number types
  if (chart.chartType === "record" || chart.valueType !== "number") {
    return null;
  }

  // Empty state
  if (!chartData.length) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  const commonProps = {
    data: chartData,
    margin: { top: 5, right: 5, left: 0, bottom: 5 },
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      {chart.visualizationType === "bar" ? (
        <BarChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Bar dataKey="value" fill={DEFAULT_CHART_COLOR} />
        </BarChart>
      ) : chart.visualizationType === "area" ? (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={DEFAULT_CHART_COLOR} 
            fill={DEFAULT_CHART_COLOR} 
            fillOpacity={0.3} 
          />
        </AreaChart>
      ) : (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="date" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={DEFAULT_CHART_COLOR} 
            strokeWidth={2} 
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}

