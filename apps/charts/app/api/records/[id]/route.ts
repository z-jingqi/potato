import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { RecordsService } from "@/lib/services";
import type { UpdateRecordRequest } from "@/lib/types/api";

// PATCH /api/records/[id] - Update a record
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json() as UpdateRecordRequest;
    const { recordDate, data } = body;

    const record = await RecordsService.updateRecord(
      id,
      session.user.id,
      { recordDate, data }
    );

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Error updating record:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update record";

    // Return 404 for "not found" errors, 400 for validation errors
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/records/[id] - Delete a record
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const result = await RecordsService.deleteRecord(
      id,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting record:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete record";

    // Return 404 for "not found" errors
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
