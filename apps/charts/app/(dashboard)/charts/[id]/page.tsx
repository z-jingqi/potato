"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useChart } from "@/lib/hooks/use-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@potato/ui/components/card";
import { Button } from "@potato/ui/components/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import {
  ChartVisualization,
  DataPointForm,
  DataPointList,
  ChartHeader,
} from "@/components/charts";

export default function ChartDetailPage() {
  const params = useParams();
  const chartId = params.id as string;
  const { chart, isLoading, mutate } = useChart(chartId);

  const [showAddForm, setShowAddForm] = useState(false);

  const handleFormSuccess = () => {
    mutate();
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="text-center py-12">
        <p>Chart not found</p>
        <Button asChild className="mt-4">
          <Link href="/charts">Back to Charts</Link>
        </Button>
      </div>
    );
  }

  // Prepare data for charts
  const chartData = chart.dataPoints
    ?.map((point) => ({
      timestamp: new Date(point.timestamp).getTime(),
      date: format(new Date(point.timestamp), "MMM d"),
      value: point.valueNumber || 0,
      text: point.valueText,
      boolean: point.valueBoolean,
    }))
    .reverse() || [];

  return (
    <div className="max-w-4xl space-y-6">
      <ChartHeader name={chart.name} description={chart.description} />

      {/* Visualization */}
      {chart.chartType === "trend" && chart.valueType === "number" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartVisualization chart={chart} chartData={chartData} />
          </CardContent>
        </Card>
      )}

      {/* Data Points */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Data Points</CardTitle>
            <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddForm && (
            <DataPointForm
              chart={chart}
              chartId={chartId}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          )}
          <DataPointList dataPoints={chart.dataPoints} unit={chart.unit} />
        </CardContent>
      </Card>
    </div>
  );
}
