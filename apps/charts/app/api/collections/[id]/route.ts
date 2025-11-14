import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { CollectionsService } from "@/lib/services";
import type { UpdateCollectionRequest } from "@/lib/types/api";

// GET /api/collections/[id] - Get a specific collection
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const collection = await CollectionsService.getCollectionById(
      id,
      session.user.id
    );

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Error fetching collection:", error);

    const message =
      error instanceof Error ? error.message : "Failed to fetch collection";

    // Return 404 for "not found" errors
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

// PATCH /api/collections/[id] - Update a collection
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
    const body = await request.json() as UpdateCollectionRequest;
    const { name, description, icon, dateDimensions } = body;

    const collection = await CollectionsService.updateCollection(
      id,
      session.user.id,
      { name, description, icon, dateDimensions }
    );

    return NextResponse.json({ collection });
  } catch (error) {
    console.error("Error updating collection:", error);

    const message =
      error instanceof Error ? error.message : "Failed to update collection";

    // Return 404 for "not found" errors, 400 for validation errors
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

// DELETE /api/collections/[id] - Delete a collection
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
    const result = await CollectionsService.deleteCollection(
      id,
      session.user.id
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting collection:", error);

    const message =
      error instanceof Error ? error.message : "Failed to delete collection";

    // Return 404 for "not found" errors
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
