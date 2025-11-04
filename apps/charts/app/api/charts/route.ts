import { NextRequest, NextResponse } from "next/server";
import { chartsDb } from "@potato/database-charts";
import { requireAuth } from "@potato/auth";
import { createChartSchema } from "@/lib/validations/schemas";

export async function GET() {
  try {
    const userId = await requireAuth();

    const userCharts = await chartsDb.chart.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(userCharts);
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

    const validatedData = createChartSchema.parse(body);

    const chart = await chartsDb.chart.create({
      data: {
        userId,
        ...validatedData,
      },
    });

    return NextResponse.json(chart, { status: 201 });
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
