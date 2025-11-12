import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { CollectionsService } from "@/lib/services";
import type { CreateCollectionRequest } from "@/lib/types/api";

// GET /api/collections - List all collections for the current user
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const collections = await CollectionsService.getCollections(
      session.user.id
    );

    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

// POST /api/collections - Create a new collection
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json() as CreateCollectionRequest;
    const { name, description, icon } = body;

    const collection = await CollectionsService.createCollection(
      session.user.id,
      { name, description, icon }
    );

    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);

    // Return specific error message
    const message =
      error instanceof Error ? error.message : "Failed to create collection";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
