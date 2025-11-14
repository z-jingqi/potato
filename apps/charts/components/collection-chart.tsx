"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@potato/ui/components/card";
import { ToggleGroup, ToggleGroupItem } from "@potato/ui/components/toggle-group";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Activity } from "lucide-react";
import type { DateDimension } from "./date-time-picker";
import { format } from "date-fns";

type ChartType = "line" | "bar" | "area" | "pie";

interface ChartRecord {
  id: string;
  recordDate: Date;
  data: string;
}

interface CollectionChartProps {
  records: ChartRecord[];
  collectionName: string;
  dateDimension?: DateDimension;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

export function CollectionChart({ records, collectionName, dateDimension = "day" }: CollectionChartProps) {
  const [chartType, setChartType] = useState<ChartType>("line");

  // Parse and transform data for charts
  const chartData = useMemo(() => {
    return records.map((record) => {
      // Try to parse numeric value from data string
      const numericMatch = record.data.match(/-?\d+\.?\d*/);
      const numericValue = numericMatch ? parseFloat(numericMatch[0]) : 0;

      // Format date based on dimension
      let formattedDate: string;
      const date = new Date(record.recordDate);

      switch (dateDimension) {
        case "year":
          formattedDate = format(date, "yyyy");
          break;
        case "month":
          formattedDate = format(date, "MMM yyyy");
          break;
        case "day":
          formattedDate = format(date, "MMM dd, yyyy");
          break;
        case "time":
          formattedDate = format(date, "MMM dd, HH:mm");
          break;
        default:
          formattedDate = format(date, "MMM dd, yyyy");
      }

      return {
        date: formattedDate,
        value: numericValue,
        originalData: record.data,
      };
    }).sort((a, b) => {
      // Sort by original date
      const dateA = records.find(r => r.data === a.originalData)?.recordDate || new Date();
      const dateB = records.find(r => r.data === b.originalData)?.recordDate || new Date();
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }, [records, dateDimension]);

  // Check if we have valid numeric data
  const hasNumericData = chartData.some((d) => d.value !== 0);

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Add data records to see visualizations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasNumericData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Charts require numeric values in your data</p>
            <p className="text-sm mt-2">Add records with numbers like: 75.5, $250, 5km</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{payload[0].payload.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Value: {payload[0].payload.originalData}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={collectionName}
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{payload[0].payload.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Value: {payload[0].payload.originalData}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                name={collectionName}
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{payload[0].payload.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Value: {payload[0].payload.originalData}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                name={collectionName}
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => {
                  const percent = entry.percent;
                  const date = entry.date;
                  if (percent !== undefined && date) {
                    return `${date}: ${(percent * 100).toFixed(0)}%`;
                  }
                  return '';
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="text-sm font-medium">{payload[0].payload.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Value: {payload[0].payload.originalData}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Data Visualization</CardTitle>
          <ToggleGroup
            type="single"
            value={chartType}
            onValueChange={(value) => {
              if (value) setChartType(value as ChartType);
            }}
            className="justify-start sm:justify-end"
          >
            <ToggleGroupItem value="line" aria-label="Line chart" size="sm">
              <LineChartIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Line</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="bar" aria-label="Bar chart" size="sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Bar</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="area" aria-label="Area chart" size="sm">
              <Activity className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Area</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="pie" aria-label="Pie chart" size="sm">
              <PieChartIcon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Pie</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
