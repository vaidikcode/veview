"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";

const statusMap = {
  draft: { label: "Draft", variant: "draft" as const },
  awaiting_review: { label: "In review", variant: "review" as const },
  approved: { label: "Approved", variant: "approved" as const },
};

export function DashboardProjects() {
  const { isAuthenticated } = useConvexAuth();
  const projects = useQuery(api.projects.list, isAuthenticated ? {} : "skip");
  const [now] = useState(() => Date.now());

  if (projects === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/90 px-8 py-20 text-center shadow-lg backdrop-blur-sm">
        <p className="font-display text-3xl text-foreground">No folders yet</p>
        <p className="mt-2 text-sm text-fg-dim">
          Create a project folder, drop media in, and share the review link.
        </p>
        <div className="mt-8 flex justify-center">
          <Button variant="accent" asChild>
            <Link href="/projects/new">New folder</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const status = statusMap[project.status];
        return (
          <Link
            key={project._id}
            href={`/projects/${project._id}`}
            data-cursor
            className="block h-full"
          >
            <article className="group relative h-full overflow-hidden rounded-xl border border-border bg-card/90 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:bg-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary font-display text-xl text-accent">
                  ⌁
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <h2 className="mt-5 truncate font-display text-2xl leading-none text-foreground">
                {project.title}
              </h2>
              {project.description && (
                <p className="mt-2 line-clamp-2 text-sm text-fg-dim">
                  {project.description}
                </p>
              )}
              <div className="mt-6 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>
                  {project.mediaCount} {project.mediaCount === 1 ? "file" : "files"}
                </span>
                <span>{formatRelativeTime(project.updatedAt, now)}</span>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
