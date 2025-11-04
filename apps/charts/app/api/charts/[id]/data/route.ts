import { NextRequest, NextResponse } from "next/server";
import { chartsDb } from "@potato/database-charts";
import { requireAuth } from "@potato/auth";
import { createDataPointSchema } from "@/lib/validations/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    // Verify chart belongs to user
    const chart = await chartsDb.chart.findFirst({
      where: {
        id,
        userId
      },
    });

    if (!chart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    const points = await chartsDb.dataPoint.findMany({
      where: { chartId: id },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json(points);
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { id } = await params;

    // Verify chart belongs to user
    const chart = await chartsDb.chart.findFirst({
      where: {
        id,
        userId
      },
    });

    if (!chart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    const validatedData = createDataPointSchema.parse(body);

    const dataPoint = await chartsDb.dataPoint.create({
      data: {
        chartId: id,
        ...validatedData,
      },
    });

    return NextResponse.json(dataPoint, { status: 201 });
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
