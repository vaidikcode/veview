"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function EnsureUser({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userId, isLoaded: clerkLoaded } = useAuth();
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Only redirect when Clerk confirms there is no session.
  // Do not use Convex isAuthenticated here — it can lag and kick signed-in users home.
  useEffect(() => {
    if (clerkLoaded && !userId) {
      router.replace("/sign-in");
    }
  }, [clerkLoaded, userId, router]);

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    let cancelled = false;

    void ensureUser()
      .then(() => {
        if (!cancelled) {
          setReadyUserId(userId);
          setSyncError(null);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setReadyUserId(null);
        setSyncError(
          error instanceof Error ? error.message : "Could not sync your account",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [ensureUser, isAuthenticated, userId]);

  if (!clerkLoaded || (userId && (convexLoading || !isAuthenticated))) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  if (readyUserId !== userId) {
    if (syncError) {
      return (
        <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center px-5 text-center">
          <p className="font-display text-2xl">Couldn’t open your workspace</p>
          <p className="mt-2 text-sm text-fg-dim">{syncError}</p>
          <button
            type="button"
            className="mt-6 rounded-full bg-accent px-5 py-2 text-sm text-accent-foreground"
            onClick={() => {
              setSyncError(null);
              setReadyUserId(null);
              void ensureUser()
                .then(() => setReadyUserId(userId))
                .catch((error: unknown) => {
                  setSyncError(
                    error instanceof Error
                      ? error.message
                      : "Could not sync your account",
                  );
                });
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return <>{children}</>;
}
