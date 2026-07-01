"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ReviewWorkspace } from "@/components/review/review-workspace";

export default function GuestReviewPage() {
  const params = useParams<{ token: string }>();
  const data = useQuery(api.review.getByShareToken, { shareToken: params.token });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-6xl items-center px-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Veview
            </p>
            <h1 className="font-display text-lg leading-tight">
              {data?.project.title ?? "Review"}
            </h1>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8">
        <ReviewWorkspace
          data={data ?? undefined}
          mode="guest"
          shareToken={params.token}
        />
      </div>
    </div>
  );
}
