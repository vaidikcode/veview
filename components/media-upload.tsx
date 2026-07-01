"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { captureProjectEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const MAX_MB = 500;

type MediaUploadProps = {
  projectId: Id<"projects">;
  compact?: boolean;
};

export function MediaUpload({ projectId, compact }: MediaUploadProps) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const markUploading = useMutation(api.files.markMediaUploading);
  const markFailed = useMutation(api.files.markMediaFailed);
  const setProjectMedia = useMutation(api.files.setProjectMedia);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      setError(`File must be under ${MAX_MB}MB`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      await markUploading({ projectId });
      const uploadUrl = await generateUploadUrl({});

      const storageId = await new Promise<Id<"_storage">>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
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

      await setProjectMedia({ projectId, storageId, contentType: file.type });
      captureProjectEvent("media_uploaded", {
        project_id: projectId,
        media_type: file.type.startsWith("video/") ? "video" : "image",
        file_size_mb: Math.round(sizeMb * 10) / 10,
      });
    } catch (e) {
      await markFailed({ projectId });
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const inputId = `upload-${projectId}`;

  return (
    <div
      className={cn(
        "rounded-md border border-dashed border-border text-center",
        compact ? "p-4" : "p-8",
      )}
    >
      <input
        id={inputId}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <label htmlFor={inputId} className="cursor-pointer">
        <p className="text-sm">
          {uploading
            ? `Uploading ${progress}%`
            : compact
              ? "Replace file"
              : "Choose video or image"}
        </p>
        {!compact && (
          <p className="mt-1 text-xs text-muted-foreground">
            MP4, WebM, PNG, JPG — max {MAX_MB}MB
          </p>
        )}
      </label>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {uploading && (
        <div className="mx-auto mt-4 h-1 max-w-xs rounded-full bg-border">
          <div
            className="h-full rounded-full bg-foreground transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {!uploading && !compact && (
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <label htmlFor={inputId}>Browse</label>
        </Button>
      )}
    </div>
  );
}
