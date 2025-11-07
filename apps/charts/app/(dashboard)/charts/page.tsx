"use client";

import Link from "next/link";
import { useCharts } from "@/lib/hooks/use-charts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@potato/ui/components/card";
import { Button } from "@potato/ui/components/button";
import { Plus, TrendingUp, FileText } from "lucide-react";

export default function ChartsPage() {
  const { charts, isLoading, isError } = useCharts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Charts</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Error loading charts</CardTitle>
            <CardDescription>Please try refreshing the page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Charts</h1>
          <p className="text-muted-foreground">Track and visualize your data</p>
        </div>
      </div>

      {charts && charts.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center py-12">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>No charts yet</CardTitle>
            <CardDescription className="max-w-sm mx-auto">
              Get started by creating your first chart to track data over time or record simple entries.
            </CardDescription>
            <div className="mt-6">
              <Button asChild>
                <Link href="/charts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Chart
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {charts?.map((chart) => (
            <Link key={chart.id} href={`/charts/${chart.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="line-clamp-1">{chart.name}</CardTitle>
                      {chart.description && (
                        <CardDescription className="line-clamp-2">
                          {chart.description}
                        </CardDescription>
                      )}
                    </div>
                    {chart.chartType === "trend" ? (
                      <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="capitalize">{chart.chartType}</span>
                    {chart.unit && <span>• {chart.unit}</span>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
