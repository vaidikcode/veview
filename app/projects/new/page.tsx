"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell";
import { EnsureUser } from "@/components/ensure-user";
import { MacFolderIcon } from "@/components/icons/mac-folder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { captureAppException, captureProjectEvent } from "@/lib/analytics";

export default function NewProjectPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const createProject = useMutation(api.projects.create);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Give it a title first");
      return;
    }
    if (!isAuthenticated) {
      setError("Still connecting to the backend. Wait a moment and try again.");
      return;
    }

    setLoading(true);
    try {
      const projectId = await createProject({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      captureProjectEvent("project_created", { project_id: projectId });
      router.push(`/projects/${projectId}`);
    } catch (e) {
      captureAppException(e, { context: "project_create" });
      const message = e instanceof Error ? e.message : "Could not create project";
      setError(
        message.includes("mediaCount") || message.includes("Could not find")
          ? "Backend is out of date. Run `npx convex deploy` for production, then try again."
          : message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <EnsureUser>
        <div className="mx-auto max-w-lg px-5 py-16">
          <div className="mb-6 flex justify-center">
            <MacFolderIcon size={80} />
          </div>
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
            New folder
          </p>
          <h1 className="mt-2 text-center font-display text-4xl text-white">
            Create a project
          </h1>
          <p className="mt-2 text-center text-sm text-white/65">
            Projects are folders. You&apos;ll add media with names and descriptions
            next.
          </p>

          <form
            className="mt-10 space-y-6 rounded-2xl border border-white/12 bg-black/50 p-6 backdrop-blur-md"
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreate();
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55"
              >
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nike spot — director's cut"
                autoFocus
                className="border-white/15 bg-black/40 text-white placeholder:text-white/35"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55"
              >
                Notes for the client
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional — what should they look at?"
                className="border-white/15 bg-black/40 text-white placeholder:text-white/35"
              />
            </div>
            {error && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-[#ffb4b0]">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button type="submit" variant="accent" disabled={loading}>
                {loading ? "Creating…" : "Create folder →"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </EnsureUser>
    </AppShell>
  );
}
