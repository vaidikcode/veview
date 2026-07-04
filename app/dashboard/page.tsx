import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EnsureUser } from "@/components/ensure-user";
import { DashboardProjects } from "@/components/dashboard-projects";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[#0a0808] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg_dashboard.png)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80"
      />

      <div className="relative z-10">
        <AppShell cta={{ href: "/projects/new", label: "New folder" }}>
          <EnsureUser>
            <div className="mx-auto max-w-6xl px-5 py-12">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                    Your folders
                  </p>
                  <h1 className="mt-2 font-display text-4xl text-white">Projects</h1>
                  <p className="mt-2 max-w-lg text-sm text-white/65">
                    Each project is a folder. Open one to add media with a name and
                    description.
                  </p>
                </div>
                <Button variant="accent" size="sm" asChild>
                  <Link href="/projects/new">+ New folder</Link>
                </Button>
              </div>
              <DashboardProjects />
            </div>
          </EnsureUser>
        </AppShell>
      </div>
    </div>
  );
}
