"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  CommentSidebar,
  type ReviewComment,
} from "@/components/review/comment-sidebar";
import { ImageReview } from "@/components/review/image-review";
import { VideoPlayer } from "@/components/review/video-player";
import { Skeleton } from "@/components/ui/skeleton";
import { getGuestDisplayName, setGuestDisplayName } from "@/lib/guest";
import { captureReviewEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ReviewMediaItem = {
  _id: Id<"mediaItems">;
  title: string;
  description?: string;
  mediaType?: "video" | "image" | "audio" | "file";
  mediaStatus: "uploading" | "ready" | "failed";
  mediaUrl: string | null;
  fileName?: string;
};

type ReviewData = {
  project: {
    _id: Id<"projects">;
    title: string;
    description?: string;
    status: "draft" | "awaiting_review" | "approved";
  };
  mediaItems: ReviewMediaItem[];
  comments: ReviewComment[];
};

type ReviewWorkspaceProps = {
  data: ReviewData | null | undefined;
  mode: "guest" | "creator";
  shareToken?: string;
  projectId?: Id<"projects">;
  header?: React.ReactNode;
};

export function ReviewWorkspace({
  data,
  mode,
  shareToken,
  projectId,
  header,
}: ReviewWorkspaceProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [selectedMediaId, setSelectedMediaId] = useState<Id<"mediaItems"> | null>(null);
  const [displayName, setDisplayName] = useState(() =>
    mode === "creator" ? "Creator" : (getGuestDisplayName() ?? ""),
  );
  const [pendingPin, setPendingPin] = useState<{
    pinX: number;
    pinY: number;
  } | null>(null);
  const [now] = useState(() => Date.now());

  const addGuestComment = useMutation(api.comments.addGuestComment);
  const addCreatorComment = useMutation(api.comments.addCreatorComment);

  const readyMedia = useMemo(
    () =>
      (data?.mediaItems ?? []).filter(
        (item) => item.mediaStatus === "ready" && item.mediaUrl,
      ),
    [data?.mediaItems],
  );

  useEffect(() => {
    if (data?.project._id && mode === "guest") {
      captureReviewEvent("review_link_opened", {
        project_id: data.project._id,
        is_returning_guest: Boolean(getGuestDisplayName()),
      });
    }
  }, [data?.project._id, mode]);

  const activeMediaId =
    selectedMediaId && readyMedia.some((m) => m._id === selectedMediaId)
      ? selectedMediaId
      : (readyMedia[0]?._id ?? null);

  const activeMedia = readyMedia.find((m) => m._id === activeMediaId) ?? null;

  const mediaComments = useMemo(
    () =>
      (data?.comments ?? []).filter(
        (c) => activeMedia && c.mediaItemId === activeMedia._id,
      ),
    [data?.comments, activeMedia],
  );

  const videoMarkers = useMemo(
    () =>
      mediaComments
        .filter((c) => c.timestampSeconds !== undefined)
        .map((c) => ({
          id: c._id,
          timestampSeconds: c.timestampSeconds!,
        })),
    [mediaComments],
  );

  const imagePins = useMemo(
    () =>
      mediaComments
        .filter((c) => c.pinX !== undefined && c.pinY !== undefined)
        .map((c) => ({
          id: c._id,
          pinX: c.pinX!,
          pinY: c.pinY!,
        })),
    [mediaComments],
  );

  if (data === undefined) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="aspect-video" />
        <Skeleton className="h-[560px]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="border border-dashed border-border py-20 text-center text-sm font-light text-muted-foreground">
        Invalid link
      </div>
    );
  }

  if (readyMedia.length === 0) {
    return (
      <div className="border border-dashed border-border py-20 text-center text-sm font-light text-muted-foreground">
        No media ready for review in this folder.
      </div>
    );
  }

  const handleSubmit = async (text: string) => {
    const name = displayName.trim();
    if (!name) throw new Error("Name required");
    if (!activeMedia) throw new Error("Select media to comment on");
    setGuestDisplayName(name);

    if (mode === "guest") {
      if (!shareToken) throw new Error("Missing share token");
      await addGuestComment({
        shareToken,
        mediaItemId: activeMedia._id,
        text,
        displayName: name,
        timestampSeconds: activeMedia.mediaType === "video" ? currentTime : undefined,
        pinX: pendingPin?.pinX,
        pinY: pendingPin?.pinY,
      });
    } else {
      if (!projectId) throw new Error("Missing project");
      await addCreatorComment({
        projectId,
        mediaItemId: activeMedia._id,
        text,
        timestampSeconds: activeMedia.mediaType === "video" ? currentTime : undefined,
        pinX: pendingPin?.pinX,
        pinY: pendingPin?.pinY,
      });
    }

    setPendingPin(null);
    captureReviewEvent("comment_added", {
      project_id: data.project._id,
      media_type: activeMedia.mediaType ?? "unknown",
      has_timestamp: activeMedia.mediaType === "video",
    });
  };

  const handleSelectComment = (comment: ReviewComment) => {
    setActiveCommentId(comment._id);
    if (comment.mediaItemId && comment.mediaItemId !== activeMediaId) {
      setSelectedMediaId(comment.mediaItemId);
    }
    if (comment.timestampSeconds !== undefined) {
      setCurrentTime(comment.timestampSeconds);
      captureReviewEvent("comment_seeked", { project_id: data.project._id });
    }
  };

  return (
    <div className="space-y-6">
      {header}

      {readyMedia.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {readyMedia.map((item) => (
            <button
              key={item._id}
              type="button"
              data-cursor
              onClick={() => {
                setSelectedMediaId(item._id);
                setActiveCommentId(null);
                setPendingPin(null);
                setCurrentTime(0);
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                item._id === activeMediaId
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-border text-fg-dim hover:border-border-strong hover:text-foreground",
              )}
            >
              {item.title}
            </button>
          ))}
        </div>
      )}

      {activeMedia?.description && (
        <p className="text-sm text-fg-dim">{activeMedia.description}</p>
      )}

      <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {activeMedia?.mediaType === "video" && activeMedia.mediaUrl ? (
            <VideoPlayer
              src={activeMedia.mediaUrl}
              comments={videoMarkers}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              onSeek={setCurrentTime}
            />
          ) : activeMedia?.mediaType === "image" && activeMedia.mediaUrl ? (
            <ImageReview
              src={activeMedia.mediaUrl}
              pins={imagePins}
              pendingPin={pendingPin}
              activePinId={activeCommentId}
              onImageClick={(pinX, pinY) => setPendingPin({ pinX, pinY })}
              onPinClick={setActiveCommentId}
            />
          ) : activeMedia?.mediaUrl ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="font-display text-xl">{activeMedia.title}</p>
              <p className="mt-2 text-sm text-fg-dim">
                Preview isn&apos;t available for this file type. Download to review.
              </p>
              <a
                href={activeMedia.mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm text-accent underline"
              >
                {activeMedia.fileName ?? "Open file"}
              </a>
            </div>
          ) : null}
        </div>
        <CommentSidebar
          comments={mediaComments}
          currentTime={currentTime}
          mediaType={
            activeMedia?.mediaType === "video" || activeMedia?.mediaType === "image"
              ? activeMedia.mediaType
              : undefined
          }
          displayName={displayName}
          onDisplayNameChange={setDisplayName}
          onSubmit={handleSubmit}
          onSelectComment={handleSelectComment}
          activeCommentId={activeCommentId}
          now={now}
        />
      </div>
    </div>
  );
}
