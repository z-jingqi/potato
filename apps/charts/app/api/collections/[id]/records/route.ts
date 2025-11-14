import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { RecordsService } from "@/lib/services";
import type { CreateRecordRequest } from "@/lib/types/api";

// POST /api/collections/[id]/records - Create new record(s)
// Supports both single record and batch creation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Check if it's batch creation (array) or single record
    if (Array.isArray(body)) {
      // Batch creation
      const records = body as CreateRecordRequest[];

      if (records.length === 0) {
        return NextResponse.json(
          { error: "At least one record is required" },
          { status: 400 }
        );
      }

      const result = await RecordsService.createManyRecords(
        id,
        session.user.id,
        records
      );

      return NextResponse.json({ count: result.count }, { status: 201 });
    } else {
      // Single record creation
      const { recordDate, data } = body as CreateRecordRequest;

      const record = await RecordsService.createRecord(
        id,
        session.user.id,
        { recordDate, data }
      );

      return NextResponse.json({ record }, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating record(s):", error);

    const message =
      error instanceof Error ? error.message : "Failed to create record(s)";

    // Return 404 for "not found" errors, 400 for validation errors
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
