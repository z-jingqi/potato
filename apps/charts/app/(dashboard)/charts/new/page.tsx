"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@potato/ui/components/card";
import { Button } from "@potato/ui/components/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ChartForm } from "@/components/charts";

export default function NewChartPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/charts">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Chart</CardTitle>
          <CardDescription>
            Set up a new chart to track your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartForm />
        </CardContent>
      </Card>
    </div>
  );
}
