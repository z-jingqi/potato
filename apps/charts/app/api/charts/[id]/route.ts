import { NextRequest, NextResponse } from "next/server";
import { chartsDb } from "@potato/database-charts";
import { requireAuth } from "@potato/auth";
import { updateChartSchema } from "@/lib/validations/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    const chart = await chartsDb.chart.findFirst({
      where: {
        id,
        userId
      },
      include: {
        category: true,
      },
    });

    if (!chart) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    // Get data points separately
    const points = await chartsDb.dataPoint.findMany({
      where: { chartId: id },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({ ...chart, dataPoints: points });
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const { id } = await params;

    const validatedData = updateChartSchema.parse(body);

    const chart = await chartsDb.chart.updateMany({
      where: {
        id,
        userId
      },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
    });

    if (chart.count === 0) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    // Fetch the updated chart
    const updatedChart = await chartsDb.chart.findUnique({
      where: { id },
    });

    return NextResponse.json(updatedChart);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireAuth();
    const { id } = await params;

    const deleted = await chartsDb.chart.deleteMany({
      where: {
        id,
        userId
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
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
