"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function EnsureUser({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userId } = useAuth();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);
  const [readyUserId, setReadyUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !userId) return;

    let cancelled = false;

    void ensureUser()
      .then(() => {
        if (!cancelled) setReadyUserId(userId);
      })
      .catch(() => {
        if (!cancelled) setReadyUserId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [ensureUser, isAuthenticated, isLoading, userId]);

  const ready = Boolean(isAuthenticated && userId && readyUserId === userId);

  if (isLoading || (isAuthenticated && !ready)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
