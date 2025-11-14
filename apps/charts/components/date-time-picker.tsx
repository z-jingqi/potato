"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@potato/ui/components/button";
import { Calendar } from "@potato/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@potato/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@potato/ui/components/select";
import { Label } from "@potato/ui/components/label";

export type DateDimension = "year" | "month" | "day" | "time";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  dimension: DateDimension;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  dimension,
  disabled,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse the value
  const date = value ? new Date(value) : new Date();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    // Preserve time if time dimension is enabled
    if (dimension === "time") {
      selectedDate.setHours(date.getHours());
      selectedDate.setMinutes(date.getMinutes());
    } else {
      selectedDate.setHours(0, 0, 0, 0);
    }

    onChange(selectedDate.toISOString());
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(date);
    newDate.setFullYear(parseInt(year));
    onChange(newDate.toISOString());
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(date);
    newDate.setMonth(parseInt(month));
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    const newDate = new Date(date);

    if (type === "hour") {
      newDate.setHours(parseInt(value));
    } else {
      newDate.setMinutes(parseInt(value));
    }

    onChange(newDate.toISOString());
  };

  const getDisplayValue = () => {
    if (!value) return "Pick a date";

    switch (dimension) {
      case "year":
        return format(date, "yyyy");
      case "month":
        return format(date, "MMMM yyyy");
      case "day":
        return format(date, "PPP");
      case "time":
        return format(date, "PPP HH:mm");
      default:
        return "Pick a date";
    }
  };

  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - 50 + i);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal h-9"
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {getDisplayValue()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 space-y-3">
            {/* Year picker */}
            <div>
              <Label className="text-xs text-muted-foreground">Year</Label>
              <Select
                value={currentYear.toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month picker */}
            {(dimension === "month" || dimension === "day" || dimension === "time") && (
              <div>
                <Label className="text-xs text-muted-foreground">Month</Label>
                <Select
                  value={currentMonth.toString()}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {format(new Date(2000, i, 1), "MMMM")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Day picker (Calendar) */}
            {(dimension === "day" || dimension === "time") && (
              <div>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </div>
            )}

            {/* Time picker */}
            {dimension === "time" && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Hour</Label>
                  <Select
                    value={date.getHours().toString()}
                    onValueChange={(value) => handleTimeChange("hour", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Minute</Label>
                  <Select
                    value={date.getMinutes().toString()}
                    onValueChange={(value) => handleTimeChange("minute", value)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 60 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
