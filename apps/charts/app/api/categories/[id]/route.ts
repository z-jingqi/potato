import { NextRequest, NextResponse } from "next/server";
import { chartsDb } from "@potato/database-charts";
import { requireAuth } from "@potato/auth";
import { updateCategorySchema } from "@/lib/validations/schemas";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    const validatedData = updateCategorySchema.parse(body);

    const category = await chartsDb.category.updateMany({
      where: {
        id: params.id,
        userId
      },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    if (category.count === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Fetch the updated category
    const updatedCategory = await chartsDb.category.findUnique({
      where: { id: params.id },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await requireAuth();

    const deleted = await chartsDb.category.deleteMany({
      where: {
        id: params.id,
        userId
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
