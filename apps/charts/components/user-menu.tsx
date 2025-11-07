"use client";

import { signOut } from "next-auth/react";
import { Button } from "@potato/ui/components/button";
import { LogOut } from "lucide-react";

export function UserMenu() {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => signOut({ callbackUrl: "/login" })}
      title="Sign Out"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
}
