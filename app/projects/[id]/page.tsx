"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { AppShell } from "@/components/app-shell";
import { EnsureUser } from "@/components/ensure-user";
import { MediaUpload } from "@/components/media-upload";
import { ShareLinkDialog } from "@/components/share-link-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { captureAppException, captureProjectEvent } from "@/lib/analytics";

const statusMap = {
  draft: { label: "Draft", variant: "draft" as const },
  awaiting_review: { label: "In review", variant: "review" as const },
  approved: { label: "Approved", variant: "approved" as const },
};

function formatBytes(bytes?: number) {
  if (bytes === undefined) return null;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProjectPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id as Id<"projects">;
  const { isAuthenticated } = useConvexAuth();
  const project = useQuery(api.projects.get, isAuthenticated ? { projectId } : "skip");
  const removeMediaItem = useMutation(api.files.removeMediaItem);

  return (
    <AppShell>
      <EnsureUser>
        {project === undefined ? (
          <div className="mx-auto max-w-3xl px-5 py-12">
            <Skeleton className="h-64" />
          </div>
        ) : !project ? (
          <div className="mx-auto max-w-3xl px-5 py-12 text-muted-foreground">
            Folder not found.
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-10 px-5 py-12">
            <header className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                  Folder
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
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

            <MediaUpload projectId={projectId} />

            <section className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-2xl">Media in this folder</h2>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {project.mediaItems.length}{" "}
                  {project.mediaItems.length === 1 ? "item" : "items"}
                </span>
              </div>

              {project.mediaItems.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
                  Empty folder — upload your first file above.
                </p>
              ) : (
                <ul className="divide-y divide-border border-y border-border">
                  {project.mediaItems.map((item) => (
                    <li
                      key={item._id}
                      className="flex flex-wrap items-start justify-between gap-4 py-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-lg leading-none">
                            {item.title}
                          </p>
                          <Badge
                            variant={
                              item.mediaStatus === "ready"
                                ? "approved"
                                : item.mediaStatus === "failed"
                                  ? "failed"
                                  : "draft"
                            }
                          >
                            {item.mediaStatus}
                          </Badge>
                          {item.mediaType && (
                            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                              {item.mediaType}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-2 text-sm text-fg-dim">{item.description}</p>
                        )}
                        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                          {[item.fileName, formatBytes(item.fileSizeBytes)]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {item.mediaUrl && item.mediaType === "image" && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.mediaUrl}
                            alt=""
                            className="mt-3 max-h-40 rounded-lg border border-border object-cover"
                          />
                        )}
                        {item.mediaUrl && item.mediaType === "video" && (
                          <video
                            src={item.mediaUrl}
                            controls
                            className="mt-3 max-h-48 w-full rounded-lg border border-border bg-black"
                          />
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          void removeMediaItem({ mediaItemId: item._id }).catch(
                            (e: unknown) => {
                              captureAppException(e, {
                                context: "media_remove",
                                project_id: projectId,
                              });
                            },
                          );
                        }}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </EnsureUser>
    </AppShell>
  );
}
