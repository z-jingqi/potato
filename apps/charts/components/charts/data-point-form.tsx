import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@potato/ui/components/button";
import { Input } from "@potato/ui/components/input";
import { Label } from "@potato/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@potato/ui/components/select";
import type { ChartWithData } from "@/types";

interface DataPointFormProps {
  chart: ChartWithData;
  chartId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DataPointForm({ chart, chartId, onSuccess, onCancel }: DataPointFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    value: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataPoint: any = {
        timestamp: new Date(formData.timestamp),
        notes: formData.notes || undefined,
      };

      // Set the appropriate value field based on chart type
      if (chart.valueType === "number") {
        dataPoint.valueNumber = parseFloat(formData.value);
      } else if (chart.valueType === "text") {
        dataPoint.valueText = formData.value;
      } else if (chart.valueType === "boolean") {
        dataPoint.valueBoolean = formData.value === "true";
      }

      const response = await fetch(`/api/charts/${chartId}/data`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataPoint),
      });

      if (response.ok) {
        setFormData({
          timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          value: "",
          notes: "",
        });
        onSuccess();
      } else {
        alert("Failed to add data point");
      }
    } catch (error) {
      alert("Failed to add data point");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
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
          <Select
            value={formData.value}
            onValueChange={(value) => setFormData({ ...formData, value })}
            required
          >
            <SelectTrigger id="value">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

