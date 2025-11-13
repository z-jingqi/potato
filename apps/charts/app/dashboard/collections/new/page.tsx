"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@potato/ui/components/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { postFetcher } from "@/lib/swr/fetcher";
import type { CollectionResponse, CreateCollectionRequest } from "@/lib/types/api";
import { CollectionForm } from "@/components/collection-form";
import type { DateDimension } from "@/components/date-time-picker";

export default function NewCollectionPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  // Use SWR mutation for creating collection
  const { trigger, isMutating } = useSWRMutation<
    CollectionResponse,
    Error,
    string,
    CreateCollectionRequest
  >("/api/collections", postFetcher);

  const handleSubmit = async (formData: {
    name: string;
    description: string;
    icon: string;
    dateDimensions: DateDimension;
    records: Array<{
      id: string;
      recordDate: string;
      data: string;
      isNew?: boolean;
    }>;
  }) => {
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter a chart name");
      return;
    }

    try {
      // Create chart first
      const result = await trigger({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        dateDimensions: formData.dateDimensions,
      });

      if (!result) {
        throw new Error("Failed to create chart");
      }

      // Filter out empty records and create them if any
      const validRecords = formData.records.filter((r) => r.data.trim() !== "");

      if (validRecords.length > 0) {
        const recordsResponse = await fetch(
          `/api/collections/${result.collection.id}/records`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              validRecords.map((r) => ({
                recordDate: r.recordDate,
                data: r.data,
              }))
            ),
          }
        );

        if (!recordsResponse.ok) {
          const errorData = await recordsResponse.json() as { error: string };
          throw new Error(errorData.error || "Failed to create records");
        }
      }

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥔</span>
              <h1 className="text-xl font-bold hidden sm:block">Potato Charts</h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Create New Chart</h2>
          <p className="text-muted-foreground">
            Charts help you organize and track your data over time
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chart Details</CardTitle>
            <CardDescription>
              Give your chart a name and choose an icon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CollectionForm
              mode="create"
              onSubmit={handleSubmit}
              isSubmitting={isMutating}
              error={error}
              onCancel={() => router.push("/dashboard")}
            />
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-6 bg-blue-50/50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span>💡</span> Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Choose a name that clearly describes what you&apos;re tracking
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Pick an icon that helps you quickly identify this collection</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  You can add data records after creating the collection
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
