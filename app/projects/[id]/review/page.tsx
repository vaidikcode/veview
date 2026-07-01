"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EnsureUser } from "@/components/ensure-user";
import { ReviewWorkspace } from "@/components/review/review-workspace";
import { ShareLinkDialog } from "@/components/share-link-dialog";
import { Button } from "@/components/ui/button";
import { captureProjectEvent } from "@/lib/analytics";

export default function CreatorReviewPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id as Id<"projects">;
  const data = useQuery(api.review.getCreatorReview, { projectId });

  return (
    <EnsureUser>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
          <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/projects/${projectId}`}>← Back</Link>
              </Button>
              <h1 className="truncate font-medium">
                {data?.project.title ?? "Review"}
              </h1>
            </div>
            {data?.shareToken && (
              <ShareLinkDialog
                shareToken={data.shareToken}
                onCopy={() =>
                  captureProjectEvent("share_link_copied", { project_id: projectId })
                }
              />
            )}
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-5 py-8">
          <ReviewWorkspace
            data={data ?? undefined}
            mode="creator"
            projectId={projectId}
            shareToken={data?.shareToken}
          />
        </div>
      </div>
    </EnsureUser>
  );
}
