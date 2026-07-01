"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";

const statusMap = {
  draft: { label: "Draft", variant: "draft" as const },
  awaiting_review: { label: "In review", variant: "review" as const },
  approved: { label: "Approved", variant: "approved" as const },
};

function Thumb({ url, type }: { url: string | null; type?: "video" | "image" }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(120%_120%_at_30%_20%,rgba(123,108,255,0.25),transparent_55%),radial-gradient(120%_120%_at_80%_90%,rgba(255,106,44,0.25),transparent_55%)]">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {type ?? "empty"}
      </span>
    </div>
  );
}

export function DashboardProjects() {
  const projects = useQuery(api.projects.list);
  const [now] = useState(() => Date.now());

  if (projects === undefined) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <RevealOnScroll className="glow-ring rounded-2xl border border-border bg-card px-8 py-20 text-center">
        <p className="font-display text-3xl">Nothing in the room yet</p>
        <p className="mt-2 text-sm text-fg-dim">
          Spin up a project, drop a cut, and send the link.
        </p>
        <div className="mt-8 flex justify-center">
          <Button variant="accent" asChild>
            <Link href="/projects/new">New project</Link>
          </Button>
        </div>
      </RevealOnScroll>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => {
        const status = statusMap[project.status];
        return (
          <RevealOnScroll key={project._id} delay={index * 50}>
            <Link
              href={`/projects/${project._id}`}
              data-cursor
              className="block h-full"
            >
              <article className="group h-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-border-strong hover:shadow-[0_0_40px_-16px_rgba(255,106,44,0.6)]">
                <div className="aspect-video overflow-hidden">
                  <Thumb url={project.mediaUrl} type={project.mediaType} />
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-display text-lg">{project.title}</p>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {formatRelativeTime(project.updatedAt, now)}
                  </p>
                </div>
              </article>
            </Link>
          </RevealOnScroll>
        );
      })}
    </div>
  );
}
