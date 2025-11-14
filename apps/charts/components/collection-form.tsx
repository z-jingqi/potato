"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@potato/ui/components/button";
import { Input } from "@potato/ui/components/input";
import { Label } from "@potato/ui/components/label";
import { Alert, AlertDescription } from "@potato/ui/components/alert";
import { Loader2, Plus, X } from "lucide-react";
import { DateTimePicker, type DateDimension } from "./date-time-picker";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@potato/ui/components/toggle-group";

const ICON_OPTIONS = [
  "📊",
  "📈",
  "📉",
  "💰",
  "🏃",
  "💪",
  "⚖️",
  "🎯",
  "📝",
  "💼",
  "🏠",
  "🚗",
  "✈️",
  "🍔",
  "📚",
  "🎮",
  "🎵",
  "🎨",
  "⚽",
  "🏋️",
];

interface RecordRow {
  id: string;
  recordDate: string;
  data: string;
  isNew?: boolean;
  isDeleted?: boolean;
  isModified?: boolean;
}

interface CollectionFormData {
  name: string;
  description: string;
  icon: string;
  dateDimensions: DateDimension;
  records: RecordRow[];
}

interface CollectionFormProps {
  mode: "create" | "edit";
  initialData?: CollectionFormData;
  onSubmit: (data: CollectionFormData) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
  onCancel: () => void;
}

export function CollectionForm({
  mode,
  initialData,
  onSubmit,
  isSubmitting,
  error,
  onCancel,
}: CollectionFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    icon: initialData?.icon || "📊",
  });

  const [dateDimensions, setDateDimensions] = useState<DateDimension>(
    initialData?.dateDimensions || "day"
  );

  const [records, setRecords] = useState<RecordRow[]>(
    initialData?.records || [
      {
        id: crypto.randomUUID(),
        recordDate: new Date().toISOString(),
        data: "",
        isNew: true,
      },
    ]
  );

  // Store initial state for comparison (memoized to prevent recreation)
  const initialFormState = useMemo(() => ({
    name: initialData?.name || "",
    description: initialData?.description || "",
    icon: initialData?.icon || "📊",
    dateDimensions: initialData?.dateDimensions || "day" as DateDimension,
    records: initialData?.records || [
      {
        id: crypto.randomUUID(),
        recordDate: new Date().toISOString(),
        data: "",
        isNew: true,
      },
    ],
  }), [initialData]);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        icon: initialData.icon,
      });
      setDateDimensions(initialData.dateDimensions);
      setRecords(initialData.records);
    }
  }, [initialData]);

  // Check if there are any changes (memoized for performance)
  const hasChanges = useMemo(() => {
    // Check basic form fields
    if (formData.name !== initialFormState.name) return true;
    if (formData.description !== initialFormState.description) return true;
    if (formData.icon !== initialFormState.icon) return true;
    if (dateDimensions !== initialFormState.dateDimensions) return true;

    // Check records
    const currentRecords = records.filter(r => !r.isDeleted);
    const initialRecords = initialFormState.records.filter(r => !r.isDeleted);

    if (currentRecords.length !== initialRecords.length) return true;

    // Check if any record has been modified
    if (records.some(r => r.isModified || r.isNew || r.isDeleted)) return true;

    // Deep compare records
    for (let i = 0; i < currentRecords.length; i++) {
      const current = currentRecords[i];
      const initial = initialRecords[i];
      if (!current || !initial || current.recordDate !== initial.recordDate || current.data !== initial.data) {
        return true;
      }
    }

    return false;
  }, [formData, dateDimensions, records, initialFormState]);

  const addRecord = () => {
    setRecords([
      ...records,
      {
        id: crypto.randomUUID(),
        recordDate: new Date().toISOString(),
        data: "",
        isNew: true,
      },
    ]);
  };

  const updateRecord = (
    id: string,
    field: "recordDate" | "data",
    value: string
  ) => {
    setRecords(
      records.map((r) =>
        r.id === id
          ? { ...r, [field]: value, isModified: !r.isNew ? true : r.isModified }
          : r
      )
    );
  };

  const markRecordDeleted = (id: string) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, isDeleted: true } : r)));
  };

  const removeNewRecord = (id: string) => {
    if (mode === "create" && records.length === 1) return; // Keep at least one row in create mode
    setRecords(records.filter((r) => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      dateDimensions,
      records,
    });
  };

  const handleRevert = () => {
    // Reset to initial state
    setFormData({
      name: initialFormState.name,
      description: initialFormState.description,
      icon: initialFormState.icon,
    });
    setDateDimensions(initialFormState.dateDimensions);
    setRecords(initialFormState.records);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Icon Selection */}
      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, icon }))}
              className={`
                text-3xl p-3 rounded-lg border-2 transition-all
                hover:scale-110 hover:shadow-md
                ${
                  formData.icon === icon
                    ? "border-primary bg-primary/10"
                    : "border-border bg-background"
                }
              `}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="e.g., Daily Weight, Monthly Budget, Running Distance..."
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          required
          autoFocus={mode === "create"}
          className="text-base"
        />
        {mode === "create" && (
          <p className="text-sm text-muted-foreground">
            Choose a clear, descriptive name for your chart
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <textarea
          id="description"
          placeholder="e.g., Track my daily weight to monitor fitness progress..."
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {mode === "create" && (
          <p className="text-sm text-muted-foreground">
            Add notes about what you&apos;ll track in this chart
          </p>
        )}
      </div>

      {/* Records Management */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{mode === "create" ? "Initial Data (optional)" : "Records"}</Label>
          <ToggleGroup
            type="single"
            value={dateDimensions}
            onValueChange={(value) => {
              if (value) setDateDimensions(value as DateDimension);
            }}
          >
            <ToggleGroupItem value="year" aria-label="Year only" size="sm">
              Year
            </ToggleGroupItem>
            <ToggleGroupItem value="month" aria-label="Month" size="sm">
              Month
            </ToggleGroupItem>
            <ToggleGroupItem value="day" aria-label="Day" size="sm">
              Day
            </ToggleGroupItem>
            <ToggleGroupItem value="time" aria-label="Time" size="sm">
              Time
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted px-3 py-2 grid grid-cols-12 gap-2 text-sm font-medium">
            <div className="col-span-4">Date</div>
            <div className="col-span-7">Value</div>
            <div className="col-span-1"></div>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {records
              .filter((r) => !r.isDeleted)
              .map((record, index) => (
                <div
                  key={record.id}
                  className={`p-3 grid grid-cols-12 gap-2 items-center hover:bg-muted/50 ${
                    record.isNew
                      ? "bg-green-50/50"
                      : record.isModified
                      ? "bg-yellow-50/50"
                      : ""
                  }`}
                >
                  <div className="col-span-4">
                    <DateTimePicker
                      value={record.recordDate}
                      onChange={(value) =>
                        updateRecord(record.id, "recordDate", value)
                      }
                      dimension={dateDimensions}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-span-7">
                    <Input
                      type="text"
                      placeholder={`Value ${index + 1}`}
                      value={record.data}
                      onChange={(e) =>
                        updateRecord(record.id, "data", e.target.value)
                      }
                      className="text-sm h-9"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        record.isNew
                          ? removeNewRecord(record.id)
                          : markRecordDeleted(record.id)
                      }
                      disabled={
                        isSubmitting ||
                        (mode === "create" && records.length === 1)
                      }
                      className="h-9 w-9 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRecord}
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Row
          </Button>
          <p className="text-sm text-muted-foreground">
            {mode === "create"
              ? "You can skip this and add data later, or add initial data points now"
              : "Add, edit, or remove records. Changes will be saved when you click \"Save Changes\"."}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || (mode === "edit" && !hasChanges)}
          className="sm:flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : mode === "create" ? (
            "Create Chart"
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={mode === "edit" ? handleRevert : onCancel}
          disabled={isSubmitting || (mode === "edit" && !hasChanges)}
          className="sm:flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
