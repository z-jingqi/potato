import Link from "next/link";
import { BarChart3, FolderKanban, Plus } from "lucide-react";
import { Button } from "@potato/ui/components/button";
import { UserMenu } from "@/components/user-menu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-first header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <Link href="/charts" className="flex items-center gap-2 font-semibold">
            <BarChart3 className="h-5 w-5" />
            <span>Charts</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/categories">
                <FolderKanban className="h-5 w-5" />
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/charts/new">
                <Plus className="h-4 w-4 mr-1" />
                New
              </Link>
            </Button>
            <UserMenu />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-6">{children}</main>

      {/* Mobile bottom nav (optional, for future) */}
    </div>
  );
}
