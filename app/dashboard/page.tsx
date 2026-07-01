import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EnsureUser } from "@/components/ensure-user";
import { DashboardProjects } from "@/components/dashboard-projects";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <AppShell cta={{ href: "/projects/new", label: "New project" }}>
      <EnsureUser>
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                Your review rooms
              </p>
              <h1 className="mt-2 font-display text-4xl">Projects</h1>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/projects/new">+ New</Link>
            </Button>
          </div>
          <DashboardProjects />
        </div>
      </EnsureUser>
    </AppShell>
  );
}
