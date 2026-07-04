"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { captureAppException, captureProjectEvent } from "@/lib/analytics";

const MAX_MB = 500;

type MediaUploadProps = {
  projectId: Id<"projects">;
};

export function MediaUpload({ projectId }: MediaUploadProps) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createMediaItem = useMutation(api.files.createMediaItem);
  const finalizeMediaItem = useMutation(api.files.finalizeMediaItem);
  const markFailed = useMutation(api.files.markMediaItemFailed);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Give this media a name");
      return;
    }
    if (!file) {
      setError("Choose a file to upload");
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      setError(`File must be under ${MAX_MB}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);
    let mediaItemId: Id<"mediaItems"> | null = null;

    try {
      mediaItemId = await createMediaItem({
        projectId,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      const uploadUrl = await generateUploadUrl({});
      const contentType = file.type || "application/octet-stream";

      const storageId = await new Promise<Id<"_storage">>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(
                (JSON.parse(xhr.responseText) as { storageId: Id<"_storage"> })
                  .storageId,
              );
            } catch {
              reject(new Error("Invalid response"));
            }
          } else reject(new Error("Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      await finalizeMediaItem({
        mediaItemId,
        storageId,
        contentType,
        fileName: file.name,
        fileSizeBytes: file.size,
      });

      const mediaType = contentType.startsWith("video/")
        ? "video"
        : contentType.startsWith("image/")
          ? "image"
          : contentType.startsWith("audio/")
            ? "audio"
            : "file";

      captureProjectEvent("media_uploaded", {
        project_id: projectId,
        media_type: mediaType,
        file_size_mb: Math.round(sizeMb * 10) / 10,
      });

      setTitle("");
      setDescription("");
      setFile(null);
    } catch (e) {
      captureAppException(e, {
        context: "media_upload",
        project_id: projectId,
      });
      if (mediaItemId) {
        try {
          await markFailed({ mediaItemId });
        } catch {
          // ignore cleanup failure
        }
      }
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card/80 p-5 backdrop-blur-sm">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
          Add media
        </p>
        <p className="mt-1 text-sm text-fg-dim">
          Name it, describe it, drop any file into this folder.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="media-title"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim"
        >
          Name
        </label>
        <Input
          id="media-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Hero cut v3"
          disabled={uploading}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="media-description"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim"
        >
          Description
        </label>
        <Textarea
          id="media-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes for reviewers"
          disabled={uploading}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="media-file"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim"
        >
          File
        </label>
        <input
          id="media-file"
          type="file"
          className="block w-full text-sm text-fg-dim file:mr-3 file:rounded-full file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:text-foreground"
          disabled={uploading}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        {file && (
          <p className="text-xs text-muted-foreground">
            {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {uploading && (
        <div className="h-1 rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <Button
        type="button"
        variant="accent"
        disabled={uploading}
        onClick={() => void handleUpload()}
      >
        {uploading ? `Uploading ${progress}%` : "Upload to folder"}
      </Button>
    </div>
  );
}
