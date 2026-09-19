"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell";
import { Skeleton } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 p-5">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
