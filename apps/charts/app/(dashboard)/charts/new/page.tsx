"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const chartFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  chartType: z.enum(["trend", "record"]),
  valueType: z.enum(["number", "text", "boolean"]),
  unit: z.string().max(50).optional(),
  visualizationType: z.enum(["line", "bar", "area"]).optional(),
});

type ChartFormValues = z.infer<typeof chartFormSchema>;

export default function NewChartPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ChartFormValues>({
    resolver: zodResolver(chartFormSchema),
    defaultValues: {
      chartType: "trend",
      valueType: "number",
      visualizationType: "line",
    },
  });

  const chartType = watch("chartType");
  const valueType = watch("valueType");

  const onSubmit = async (data: ChartFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/charts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const chart = await response.json();
        router.push(`/charts/${chart.id}`);
      } else {
        alert("Failed to create chart");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/charts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Chart</CardTitle>
          <CardDescription>
            Set up a new chart to track your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Daily Weight, Mood Tracker"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional description"
                {...register("description")}
              />
            </div>

            {/* Chart Type */}
            <div className="space-y-2">
              <Label htmlFor="chartType">Chart Type *</Label>
              <select
                id="chartType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("chartType")}
              >
                <option value="trend">Trend (Time series with visualization)</option>
                <option value="record">Record (Simple text/value entries)</option>
              </select>
            </div>

            {/* Value Type */}
            <div className="space-y-2">
              <Label htmlFor="valueType">Value Type *</Label>
              <select
                id="valueType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("valueType")}
              >
                <option value="number">Number</option>
                <option value="text">Text</option>
                <option value="boolean">Yes/No</option>
              </select>
            </div>

            {/* Unit (only for number type) */}
            {valueType === "number" && (
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="e.g., kg, cm, hours"
                  {...register("unit")}
                />
              </div>
            )}

            {/* Visualization Type (only for trend charts) */}
            {chartType === "trend" && valueType === "number" && (
              <div className="space-y-2">
                <Label htmlFor="visualizationType">Visualization Type</Label>
                <select
                  id="visualizationType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register("visualizationType")}
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="area">Area Chart</option>
                </select>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating..." : "Create Chart"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/charts">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
