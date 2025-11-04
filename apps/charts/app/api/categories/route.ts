import { NextRequest, NextResponse } from "next/server";
import { chartsDb } from "@potato/database-charts";
import { requireAuth } from "@potato/auth";
import { createCategorySchema } from "@/lib/validations/schemas";

export async function GET() {
  try {
    const userId = await requireAuth();

    const userCategories = await chartsDb.category.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(userCategories);
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

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();

    const validatedData = createCategorySchema.parse(body);

    const category = await chartsDb.category.create({
      data: {
        userId,
        ...validatedData,
      },
    });

    return NextResponse.json(category, { status: 201 });
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
