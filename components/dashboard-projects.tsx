"use client";

import Link from "next/link";
import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MacFolderIcon } from "@/components/icons/mac-folder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

const statusMap = {
  draft: { label: "Draft", variant: "draft" as const },
  awaiting_review: { label: "In review", variant: "review" as const },
  approved: { label: "Approved", variant: "approved" as const },
};

export function DashboardProjects() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const projects = useQuery(api.projects.list, isAuthenticated ? {} : "skip");
  const [now] = useState(() => Date.now());

  if (isLoading || !isAuthenticated) {
    return (
      <div className="rounded-xl border border-white/15 bg-black/50 px-8 py-16 text-center">
        <p className="font-display text-2xl text-white">Connecting…</p>
        <p className="mt-2 text-sm text-white/65">Loading your folders.</p>
      </div>
    );
  }

  if (projects === undefined) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl border border-white/15 bg-white/10"
          />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-2xl border border-white/15 bg-black/55 px-8 py-16 text-center shadow-xl backdrop-blur-md">
        <div className="flex justify-center">
          <MacFolderIcon size={72} />
        </div>
        <p className="mt-6 font-display text-3xl text-white">No folders yet</p>
        <p className="mt-2 text-sm text-white/65">
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        const status = statusMap[project.status];
        return (
          <Link
            key={project._id}
            href={`/projects/${project._id}`}
            className="block h-full rounded-2xl outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-accent"
          >
            <article className="group flex h-full flex-col items-center rounded-2xl border border-white/12 bg-black/50 px-5 py-8 text-center shadow-xl backdrop-blur-md transition-transform duration-200 hover:-translate-y-1 hover:border-white/25 hover:bg-black/65">
              <MacFolderIcon
                size={88}
                className="transition-transform duration-200 group-hover:scale-105"
              />
              <h2 className="mt-5 w-full truncate font-display text-xl text-white">
                {project.title}
              </h2>
              {project.description && (
                <p className="mt-2 line-clamp-2 text-sm text-white/60">
                  {project.description}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Badge variant={status.variant}>{status.label}</Badge>
                <span className="font-mono text-[11px] text-white/50">
                  {project.mediaCount} {project.mediaCount === 1 ? "file" : "files"}
                </span>
              </div>
              <p className="mt-3 font-mono text-[11px] text-white/40">
                {formatRelativeTime(project.updatedAt, now)}
              </p>
            </article>
          </Link>
        );
      })}
    </div>
  );
}
