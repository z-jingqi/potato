"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useChart } from "@/lib/hooks/use-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ChartDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chartId = params.id as string;
  const { chart, isLoading, mutate } = useChart(chartId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    value: "",
    notes: "",
  });

  const handleAddDataPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataPoint: any = {
        timestamp: new Date(formData.timestamp),
        notes: formData.notes || undefined,
      };

      // Set the appropriate value field based on chart type
      if (chart?.valueType === "number") {
        dataPoint.valueNumber = parseFloat(formData.value);
      } else if (chart?.valueType === "text") {
        dataPoint.valueText = formData.value;
      } else if (chart?.valueType === "boolean") {
        dataPoint.valueBoolean = formData.value === "true";
      }

      const response = await fetch(`/api/charts/${chartId}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataPoint),
      });

      if (response.ok) {
        mutate();
        setFormData({
          timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          value: "",
          notes: "",
        });
        setShowAddForm(false);
      }
    } catch (error) {
      alert("Failed to add data point");
    } finally {
      setIsSubmitting(false);
    }
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

  const renderChart = () => {
    if (chart.chartType === "record" || chart.valueType !== "number") {
      return null;
    }

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
            <Bar dataKey="value" fill="hsl(var(--primary))" />
          </BarChart>
        ) : chart.visualizationType === "area" ? (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
          </AreaChart>
        ) : (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/charts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{chart.name}</h1>
        {chart.description && (
          <p className="text-muted-foreground mt-2">{chart.description}</p>
        )}
      </div>

      {/* Visualization */}
      {chart.chartType === "trend" && chart.valueType === "number" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trend</CardTitle>
          </CardHeader>
          <CardContent>{renderChart()}</CardContent>
        </Card>
      )}

      {/* Add Data Form */}
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
            <form onSubmit={handleAddDataPoint} className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="timestamp">Date & Time</Label>
                <Input
                  type="datetime-local"
                  id="timestamp"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">
                  Value {chart.unit && `(${chart.unit})`}
                </Label>
                {chart.valueType === "number" && (
                  <Input
                    type="number"
                    step="any"
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                )}
                {chart.valueType === "text" && (
                  <Input
                    type="text"
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                )}
                {chart.valueType === "boolean" && (
                  <select
                    id="value"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Data Point"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Data Points List */}
          <div className="space-y-2">
            {chart.dataPoints && chart.dataPoints.length > 0 ? (
              chart.dataPoints.map((point) => (
                <div key={point.id} className="flex justify-between items-start p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">
                      {point.valueNumber !== null && `${point.valueNumber} ${chart.unit || ""}`}
                      {point.valueText !== null && point.valueText}
                      {point.valueBoolean !== null && (point.valueBoolean ? "Yes" : "No")}
                    </p>
                    {point.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{point.notes}</p>
                    )}
                  </div>
                  <time className="text-sm text-muted-foreground whitespace-nowrap ml-4">
                    {format(new Date(point.timestamp), "MMM d, yyyy HH:mm")}
                  </time>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No data points yet. Add your first entry above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
