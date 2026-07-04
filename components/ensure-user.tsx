"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

/**
 * Syncs the Clerk user into Convex, then renders children.
 * Uses Clerk (not Convex) for sign-out redirects so auth lag can't kick users home.
 */
export function EnsureUser({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userId, isLoaded: clerkLoaded } = useAuth();
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const ensureUser = useMutation(api.users.ensureUser);
  const [readyUserId, setReadyUserId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (clerkLoaded && !userId) {
      router.replace("/sign-in");
    }
  }, [clerkLoaded, userId, router]);

  useEffect(() => {
    if (!userId) return;
    const timer = window.setTimeout(() => setTimedOut(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [userId]);

  useEffect(() => {
    if (!userId || !isAuthenticated) return;

    let cancelled = false;

    void ensureUser()
      .then(() => {
        if (!cancelled) {
          setReadyUserId(userId);
          setSyncError(null);
          setTimedOut(false);
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

  const retry = () => {
    if (!userId || !isAuthenticated) return;
    setSyncError(null);
    setTimedOut(false);
    setReadyUserId(null);
    void ensureUser()
      .then(() => setReadyUserId(userId))
      .catch((error: unknown) => {
        setSyncError(
          error instanceof Error ? error.message : "Could not sync your account",
        );
      });
  };

  if (!clerkLoaded) {
    return <StatusPanel title="Loading…" body="Checking your session." />;
  }

  if (!userId) {
    return null;
  }

  if (readyUserId === userId) {
    return <>{children}</>;
  }

  if (syncError) {
    return (
      <StatusPanel
        title="Couldn’t open your workspace"
        body={syncError}
        actionLabel="Try again"
        onAction={retry}
      />
    );
  }

  if (timedOut && (!isAuthenticated || convexLoading)) {
    return (
      <StatusPanel
        title="Still connecting…"
        body="Convex auth is taking too long. Confirm NEXT_PUBLIC_CONVEX_URL points at the deployment where you ran npx convex deploy, then retry."
        actionLabel="Try again"
        onAction={retry}
      />
    );
  }

  return (
    <StatusPanel
      title="Opening workspace…"
      body={
        convexLoading || !isAuthenticated
          ? "Connecting to Convex…"
          : "Syncing your account…"
      }
    />
  );
}

function StatusPanel({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-3xl text-white">{title}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/70">{body}</p>
      {actionLabel && onAction && (
        <Button type="button" variant="accent" className="mt-8" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
