import { format } from "date-fns";
import type { DataPoint } from "@potato/database-charts";

interface DataPointListProps {
  dataPoints?: DataPoint[];
  unit?: string | null;
}

export function DataPointList({ dataPoints, unit }: DataPointListProps) {
  if (!dataPoints || dataPoints.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No data points yet. Add your first entry above.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {dataPoints.map((point) => (
        <div key={point.id} className="flex justify-between items-start p-3 border rounded-lg">
          <div className="flex-1">
            <p className="font-medium">
              {point.valueNumber !== null && `${point.valueNumber} ${unit || ""}`}
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
      ))}
    </div>
  );
}

