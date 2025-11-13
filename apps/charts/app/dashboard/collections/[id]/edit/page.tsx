"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { Button } from "@potato/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@potato/ui/components/card";
import { Alert, AlertDescription } from "@potato/ui/components/alert";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { patchFetcher } from "@/lib/swr/fetcher";
import type {
  CollectionResponse,
  UpdateCollectionRequest,
  SuccessResponse,
} from "@/lib/types/api";
import { CollectionForm } from "@/components/collection-form";
import type { DateDimension } from "@/components/date-time-picker";

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  // Use SWR for fetching collection data
  const { data, error, isLoading } = useSWR<CollectionResponse>(
    `/api/collections/${collectionId}`
  );

  const collection = data?.collection;

  // Use SWR mutations for update and delete
  const { trigger: updateTrigger } = useSWRMutation<
    CollectionResponse,
    Error,
    string,
    UpdateCollectionRequest
  >(`/api/collections/${collectionId}`, patchFetcher);

  const { trigger: deleteTrigger, isMutating: isDeleting } = useSWRMutation<
    SuccessResponse,
    Error,
    string,
    never
  >(`/api/collections/${collectionId}`, async (url) => {
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) {
      const errorData = (await response.json()) as { error: string };
      throw new Error(errorData.error || "Failed to delete");
    }
    return response.json() as Promise<SuccessResponse>;
  });

  const [actionError, setActionError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);

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
      isDeleted?: boolean;
      isModified?: boolean;
    }>;
  }) => {
    setActionError("");

    if (!formData.name.trim()) {
      setActionError("Please enter a chart name");
      return;
    }

    setIsSavingAll(true);

    try {
      // 1. Update chart metadata
      await updateTrigger({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        dateDimensions: formData.dateDimensions,
      });

      // 2. Handle record changes
      const recordsToCreate = formData.records.filter(
        (r) => r.isNew && !r.isDeleted && r.data.trim()
      );
      const recordsToUpdate = formData.records.filter(
        (r) => !r.isNew && r.isModified && !r.isDeleted
      );
      const recordsToDelete = formData.records.filter(
        (r) => !r.isNew && r.isDeleted
      );

      // Create new records
      if (recordsToCreate.length > 0) {
        const createResponse = await fetch(
          `/api/collections/${collectionId}/records`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              recordsToCreate.map((r) => ({
                recordDate: r.recordDate,
                data: r.data,
              }))
            ),
          }
        );

        if (!createResponse.ok) {
          const errorData = (await createResponse.json()) as { error: string };
          throw new Error(errorData.error || "Failed to create records");
        }
      }

      // Update existing records
      for (const record of recordsToUpdate) {
        const updateResponse = await fetch(`/api/records/${record.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recordDate: record.recordDate,
            data: record.data,
          }),
        });

        if (!updateResponse.ok) {
          const errorData = (await updateResponse.json()) as { error: string };
          throw new Error(errorData.error || `Failed to update record`);
        }
      }

      // Delete records
      for (const record of recordsToDelete) {
        const deleteResponse = await fetch(`/api/records/${record.id}`, {
          method: "DELETE",
        });

        if (!deleteResponse.ok) {
          const errorData = (await deleteResponse.json()) as { error: string };
          throw new Error(errorData.error || `Failed to delete record`);
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Something went wrong"
      );
      setIsSavingAll(false);
    }
  };

  const handleDelete = async () => {
    setActionError("");

    try {
      await deleteTrigger();

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">
            {error ? error.message : "Chart not found"}
          </p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const initialFormData = {
    name: collection.name,
    description: collection.description || "",
    icon: collection.icon || "📊",
    dateDimensions: (collection.dateDimensions || "day") as DateDimension,
    records: collection.records.map((record) => ({
      id: record.id,
      recordDate: new Date(record.recordDate).toISOString(),
      data: record.data,
      isNew: false,
      isDeleted: false,
      isModified: false,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-card/50 backdrop-blur-md">
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
              <h1 className="text-xl font-bold hidden sm:block">
                Potato Charts
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Edit Chart</h2>
          <p className="text-muted-foreground">
            Update your chart details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Chart Details</CardTitle>
            <CardDescription>
              Update the name, description, or icon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CollectionForm
              mode="edit"
              initialData={initialFormData}
              onSubmit={handleSubmit}
              isSubmitting={isSavingAll}
              error={actionError}
              onCancel={() => router.push("/dashboard")}
            />
          </CardContent>
        </Card>

        {/* Delete Section */}
        <Card className="mt-6 border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this chart and all its data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSavingAll || isDeleting}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Chart
              </Button>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertDescription>
                    Are you sure? This action cannot be undone. All records in
                    this chart will be permanently deleted.
                  </AlertDescription>
                </Alert>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="sm:flex-1"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Yes, Delete Forever
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="sm:flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
