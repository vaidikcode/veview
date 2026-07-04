"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell";
import { EnsureUser } from "@/components/ensure-user";
import { MediaUpload } from "@/components/media-upload";
import { ShareLinkDialog } from "@/components/share-link-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { captureProjectEvent } from "@/lib/analytics";

const statusMap = {
  draft: { label: "Draft", variant: "draft" as const },
  awaiting_review: { label: "In review", variant: "review" as const },
  approved: { label: "Approved", variant: "approved" as const },
};

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id as Id<"projects">;
  const { isAuthenticated } = useConvexAuth();
  const project = useQuery(api.projects.get, isAuthenticated ? { projectId } : "skip");

  return (
    <AppShell>
      <EnsureUser>
        {project === undefined ? (
          <div className="mx-auto max-w-3xl px-5 py-12">
            <Skeleton className="h-64" />
          </div>
        ) : !project ? (
          <div className="mx-auto max-w-3xl px-5 py-12 text-muted-foreground">
            Project not found.
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-10 px-5 py-12">
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-4xl">{project.title}</h1>
                  <Badge variant={statusMap[project.status].variant}>
                    {statusMap[project.status].label}
                  </Badge>
                </div>
                {project.description && (
                  <p className="mt-2 max-w-xl text-sm text-fg-dim">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/projects/${project._id}/review`}>Open review</Link>
                </Button>
                <ShareLinkDialog
                  shareToken={project.shareToken}
                  onCopy={() =>
                    captureProjectEvent("share_link_copied", {
                      project_id: project._id,
                    })
                  }
                />
              </div>
            </header>

            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              {project.mediaUrl && project.mediaStatus === "ready" ? (
                <>
                  <div className="bg-black">
                    {project.mediaType === "video" ? (
                      <video src={project.mediaUrl} controls className="w-full" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.mediaUrl} alt="" className="w-full" />
                    )}
                  </div>
                  <div className="border-t border-border p-4">
                    <MediaUpload projectId={projectId} compact />
                  </div>
                </>
              ) : (
                <div className="p-6">
                  <MediaUpload projectId={projectId} />
                </div>
              )}
            </section>
          </div>
        )}
      </EnsureUser>
    </AppShell>
  );
}
