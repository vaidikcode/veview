"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "@/components/app-shell";
import { EnsureUser } from "@/components/ensure-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { captureAppException, captureProjectEvent } from "@/lib/analytics";

export default function NewProjectPage() {
  const router = useRouter();
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
      setError(e instanceof Error ? e.message : "Could not create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <EnsureUser>
        <div className="mx-auto max-w-lg px-5 py-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
            New folder
          </p>
          <h1 className="mt-2 font-display text-4xl">Create a project</h1>
          <p className="mt-2 text-sm text-fg-dim">
            Projects are folders. You&apos;ll add media with names and descriptions
            next.
          </p>

          <form
            className="mt-10 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreate();
            }}
          >
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim"
              >
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nike spot — director's cut"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim"
              >
                Notes for the client
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional — what should they look at?"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" variant="accent" disabled={loading}>
              {loading ? "Creating…" : "Create folder →"}
            </Button>
          </form>
        </div>
      </EnsureUser>
    </AppShell>
  );
}
