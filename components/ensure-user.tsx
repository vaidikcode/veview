"use client";

import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export function EnsureUser({ children }: { children: React.ReactNode }) {
  const ensureUser = useMutation(api.users.ensureUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void ensureUser()
      .then(() => setReady(true))
      .catch(() => setReady(true));
  }, [ensureUser]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  return <>{children}</>;
}
