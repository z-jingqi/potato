"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Button } from "@potato/ui/components/button";
import { Input } from "@potato/ui/components/input";
import { Label } from "@potato/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@potato/ui/components/card";
import { Alert, AlertDescription } from "@potato/ui/components/alert";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import type { CollectionResponse } from "@/lib/types/api";

export default function CollectionViewPage() {
  const params = useParams<{ id: string }>();
  const collectionId = params.id!;

  // Use SWR with global fetcher - no need to define fetcher!
  const { data, error, isLoading, mutate } = useSWR<CollectionResponse>(
    `/api/collections/${collectionId}`
  );

  const collection = data?.collection;

  const [actionError, setActionError] = useState("");

  // Single record form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingRecord, setAddingRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    recordDate: new Date().toISOString().split("T")[0],
    data: "",
  });

  // Batch add form
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [addingBatch, setAddingBatch] = useState(false);
  const [batchRecords, setBatchRecords] = useState([
    { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
    { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
    { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
  ]);

  // Edit record
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    recordDate: "",
    data: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");

    if (!newRecord.data.trim()) {
      setActionError("Please enter a value");
      return;
    }

    setAddingRecord(true);

    try {
      const response = await fetch(`/api/collections/${collectionId}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || "Failed to add record");
      }

      await response.json();

      // Revalidate collection data with SWR
      await mutate();

      // Reset form
      setNewRecord({
        recordDate: new Date().toISOString().split("T")[0],
        data: "",
      });
      setShowAddForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingRecord(false);
    }
  };

  const startEdit = (record: CollectionResponse["collection"]["records"][number]) => {
    setEditingId(record.id);
    setEditData({
      recordDate: new Date(record.recordDate).toISOString().split("T")[0]!,
      data: record.data,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ recordDate: "", data: "" });
  };

  const handleSaveEdit = async (recordId: string) => {
    setActionError("");
    setSavingEdit(true);

    try {
      const response = await fetch(`/api/records/${recordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || "Failed to update record");
      }

      await response.json();

      // Revalidate collection data with SWR
      await mutate();
      setEditingId(null);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm("Are you sure you want to delete this record?")) {
      return;
    }

    setActionError("");

    try {
      const response = await fetch(`/api/records/${recordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || "Failed to delete record");
      }

      // Revalidate collection data with SWR
      await mutate();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  // Batch add handlers
  const addBatchRow = () => {
    setBatchRecords([
      ...batchRecords,
      { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
    ]);
  };

  const removeBatchRow = (id: string) => {
    if (batchRecords.length === 1) return;
    setBatchRecords(batchRecords.filter((r) => r.id !== id));
  };

  const updateBatchRecord = (id: string, field: "recordDate" | "data", value: string) => {
    setBatchRecords(batchRecords.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleBatchAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError("");

    const validRecords = batchRecords.filter((r) => r.data.trim() !== "");

    if (validRecords.length === 0) {
      setActionError("Please add at least one record with data");
      return;
    }

    setAddingBatch(true);

    try {
      const response = await fetch(`/api/collections/${collectionId}/records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          validRecords.map((r) => ({
            recordDate: r.recordDate,
            data: r.data,
          }))
        ),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error: string };
        throw new Error(errorData.error || "Failed to add records");
      }

      // Revalidate collection data with SWR
      await mutate();

      // Reset form
      setBatchRecords([
        { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
        { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
        { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
      ]);
      setShowBatchForm(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingBatch(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">
            {error ? error.message : "Collection not found"}
          </p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
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
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Collection Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{collection.icon}</div>
            <div>
              <h2 className="text-3xl font-bold mb-2">{collection.name}</h2>
              {collection.description && (
                <p className="text-muted-foreground">{collection.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                {collection.records.length} {collection.records.length === 1 ? "record" : "records"}
              </p>
            </div>
          </div>
          <Link href={`/dashboard/collections/${collection.id}/edit`}>
            <Button variant="outline">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Collection
            </Button>
          </Link>
        </div>

        {actionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{actionError}</AlertDescription>
          </Alert>
        )}

        {/* Add Record Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Records</CardTitle>
                <CardDescription>Add and manage your data points</CardDescription>
              </div>
              {!showAddForm && !showBatchForm && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAddForm(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add One
                  </Button>
                  <Button onClick={() => setShowBatchForm(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Batch Add
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showAddForm && (
              <form onSubmit={handleAddRecord} className="mb-6 p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="recordDate">Date</Label>
                    <Input
                      id="recordDate"
                      type="date"
                      value={newRecord.recordDate}
                      onChange={(e) =>
                        setNewRecord((prev) => ({
                          ...prev,
                          recordDate: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data">Value</Label>
                    <Input
                      id="data"
                      type="text"
                      placeholder="e.g., 75.5, $250, 5km..."
                      value={newRecord.data}
                      onChange={(e) =>
                        setNewRecord((prev) => ({
                          ...prev,
                          data: e.target.value,
                        }))
                      }
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addingRecord} size="sm">
                    {addingRecord ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Record
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewRecord({
                        recordDate: new Date().toISOString().split("T")[0],
                        data: "",
                      });
                    }}
                    disabled={addingRecord}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Batch Add Form */}
            {showBatchForm && (
              <form onSubmit={handleBatchAdd} className="mb-6 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Add Multiple Records</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBatchRow}
                      disabled={addingBatch}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Row
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-3 py-2 grid grid-cols-12 gap-2 text-sm font-medium">
                      <div className="col-span-5">Date</div>
                      <div className="col-span-6">Value</div>
                      <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                      {batchRecords.map((record, index) => (
                        <div
                          key={record.id}
                          className="p-3 grid grid-cols-12 gap-2 items-center hover:bg-muted/50"
                        >
                          <div className="col-span-5">
                            <Input
                              type="date"
                              value={record.recordDate}
                              onChange={(e) =>
                                updateBatchRecord(record.id, "recordDate", e.target.value)
                              }
                              className="text-sm h-9"
                              disabled={addingBatch}
                            />
                          </div>
                          <div className="col-span-6">
                            <Input
                              type="text"
                              placeholder={`Value ${index + 1}`}
                              value={record.data}
                              onChange={(e) =>
                                updateBatchRecord(record.id, "data", e.target.value)
                              }
                              className="text-sm h-9"
                              disabled={addingBatch}
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeBatchRow(record.id)}
                              disabled={batchRecords.length === 1 || addingBatch}
                              className="h-9 w-9 p-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={addingBatch} size="sm">
                      {addingBatch ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add All Records
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowBatchForm(false);
                        setBatchRecords([
                          { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
                          { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
                          { id: crypto.randomUUID(), recordDate: new Date().toISOString().split("T")[0]!, data: "" },
                        ]);
                      }}
                      disabled={addingBatch}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Records List */}
            {collection.records.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No records yet</p>
                <p className="text-sm mb-4">
                  Add your first data point to get started
                </p>
                {!showAddForm && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Record
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header for larger screens */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                  <div className="col-span-4">Date</div>
                  <div className="col-span-6">Value</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Records */}
                {collection.records.map((record) => (
                  <div
                    key={record.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {editingId === record.id ? (
                      <>
                        <div className="sm:col-span-4">
                          <Input
                            type="date"
                            value={editData.recordDate}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                recordDate: e.target.value,
                              }))
                            }
                            className="text-sm"
                          />
                        </div>
                        <div className="sm:col-span-6">
                          <Input
                            type="text"
                            value={editData.data}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                data: e.target.value,
                              }))
                            }
                            className="text-sm"
                          />
                        </div>
                        <div className="sm:col-span-2 flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(record.id)}
                            disabled={savingEdit}
                            className="flex-1 sm:flex-none"
                          >
                            {savingEdit ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            disabled={savingEdit}
                            className="flex-1 sm:flex-none"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="sm:col-span-4 flex items-center gap-2">
                          <span className="text-sm sm:hidden font-medium text-muted-foreground">
                            Date:
                          </span>
                          <span className="text-sm">
                            {new Date(record.recordDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="sm:col-span-6 flex items-center gap-2">
                          <span className="text-sm sm:hidden font-medium text-muted-foreground">
                            Value:
                          </span>
                          <span className="text-sm font-medium">
                            {record.data}
                          </span>
                        </div>
                        <div className="sm:col-span-2 flex gap-2 justify-end mt-2 sm:mt-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEdit(record)}
                            className="flex-1 sm:flex-none"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="flex-1 sm:flex-none text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span>💡</span> Quick Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Click &quot;Add Record&quot; to quickly log new data points</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Edit any record by clicking the edit icon</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">•</span>
                <span>Your data is automatically saved and ready for visualization</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
