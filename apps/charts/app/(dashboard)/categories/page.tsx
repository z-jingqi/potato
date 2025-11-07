"use client";

import { Card, CardHeader, CardTitle, CardDescription } from "@potato/ui/components/card";

export default function CategoriesPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>
            Category management will be available in a future update.
            For now, charts can be created without categories.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
