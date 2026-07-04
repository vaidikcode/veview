"use client";

import { useEffect } from "react";
import Link from "next/link";
import { captureAppException } from "@/lib/analytics";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureAppException(error, {
      boundary: "app_error",
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
        Something broke
      </p>
      <h1 className="mt-3 font-display text-4xl">This frame didn&apos;t load.</h1>
      <p className="mt-3 max-w-md text-sm text-fg-dim">
        We logged the error. Try again, or head back to the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="accent" onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
