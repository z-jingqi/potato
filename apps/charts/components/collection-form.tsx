"use client";

import { useState, useEffect } from "react";
import { Button } from "@potato/ui/components/button";
import { Input } from "@potato/ui/components/input";
import { Label } from "@potato/ui/components/label";
import { Alert, AlertDescription } from "@potato/ui/components/alert";
import { Loader2, Plus, X } from "lucide-react";

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

  const [records, setRecords] = useState<RecordRow[]>(
    initialData?.records || [
      {
        id: crypto.randomUUID(),
        recordDate: new Date().toISOString().split("T")[0]!,
        data: "",
        isNew: true,
      },
    ]
  );

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description,
        icon: initialData.icon,
      });
      setRecords(initialData.records);
    }
  }, [initialData]);

  const addRecord = () => {
    setRecords([
      ...records,
      {
        id: crypto.randomUUID(),
        recordDate: new Date().toISOString().split("T")[0]!,
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
      records,
    });
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
            Choose a clear, descriptive name for your collection
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
            Add notes about what you&apos;ll track in this collection
          </p>
        )}
      </div>

      {/* Records Management */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{mode === "create" ? "Initial Data (optional)" : "Records"}</Label>
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
                    <Input
                      type="date"
                      value={record.recordDate}
                      onChange={(e) =>
                        updateRecord(record.id, "recordDate", e.target.value)
                      }
                      className="text-sm h-9"
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
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? "You can skip this and add data later, or add initial data points now"
            : "Add, edit, or remove records. Changes will be saved when you click \"Save Changes\"."}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="sm:flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {mode === "create" ? "Creating..." : "Saving..."}
            </>
          ) : mode === "create" ? (
            "Create Collection"
          ) : (
            "Save Changes"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="sm:flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
