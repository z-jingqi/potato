import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function ChartForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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
        <Select
          value={chartType}
          onValueChange={(value) => setValue("chartType", value as "trend" | "record")}
        >
          <SelectTrigger id="chartType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="trend">Trend (Time series with visualization)</SelectItem>
            <SelectItem value="record">Record (Simple text/value entries)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Value Type */}
      <div className="space-y-2">
        <Label htmlFor="valueType">Value Type *</Label>
        <Select
          value={valueType}
          onValueChange={(value) => setValue("valueType", value as "number" | "text" | "boolean")}
        >
          <SelectTrigger id="valueType">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="boolean">Yes/No</SelectItem>
          </SelectContent>
        </Select>
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
          <Select
            value={watch("visualizationType")}
            onValueChange={(value) =>
              setValue("visualizationType", value as "line" | "bar" | "area")
            }
          >
            <SelectTrigger id="visualizationType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
            </SelectContent>
          </Select>
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
  );
}

