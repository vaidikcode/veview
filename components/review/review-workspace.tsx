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

type ReviewData = {
  project: {
    _id: Id<"projects">;
    title: string;
    description?: string;
    status: "draft" | "awaiting_review" | "approved";
    mediaType?: "video" | "image";
    mediaStatus?: "uploading" | "ready" | "failed";
    mediaUrl: string | null;
  };
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

  useEffect(() => {
    if (data?.project._id && mode === "guest") {
      captureReviewEvent("review_link_opened", {
        project_id: data.project._id,
        is_returning_guest: Boolean(getGuestDisplayName()),
      });
    }
  }, [data?.project._id, mode]);

  const videoMarkers = useMemo(
    () =>
      (data?.comments ?? [])
        .filter((c) => c.timestampSeconds !== undefined)
        .map((c) => ({
          id: c._id,
          timestampSeconds: c.timestampSeconds!,
        })),
    [data?.comments],
  );

  const imagePins = useMemo(
    () =>
      (data?.comments ?? [])
        .filter((c) => c.pinX !== undefined && c.pinY !== undefined)
        .map((c) => ({
          id: c._id,
          pinX: c.pinX!,
          pinY: c.pinY!,
        })),
    [data?.comments],
  );

  if (data === undefined) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="aspect-video" />
        <Skeleton className="h-[560px]" />
      </div>
    );
  }

  if (!data || !data.project.mediaUrl) {
    return (
      <div className="border border-dashed border-border py-20 text-center text-sm font-light text-muted-foreground">
        {data === null ? "Invalid link" : "Media not ready"}
      </div>
    );
  }

  const handleSubmit = async (text: string) => {
    const name = displayName.trim();
    if (!name) throw new Error("Name required");
    setGuestDisplayName(name);

    if (mode === "guest") {
      if (!shareToken) throw new Error("Missing share token");
      await addGuestComment({
        shareToken,
        text,
        displayName: name,
        timestampSeconds: data.project.mediaType === "video" ? currentTime : undefined,
        pinX: pendingPin?.pinX,
        pinY: pendingPin?.pinY,
      });
    } else {
      if (!projectId) throw new Error("Missing project");
      await addCreatorComment({
        projectId,
        text,
        timestampSeconds: data.project.mediaType === "video" ? currentTime : undefined,
        pinX: pendingPin?.pinX,
        pinY: pendingPin?.pinY,
      });
    }

    setPendingPin(null);
    captureReviewEvent("comment_added", {
      project_id: data.project._id,
      media_type: data.project.mediaType ?? "unknown",
      has_timestamp: data.project.mediaType === "video",
    });
  };

  const handleSelectComment = (comment: ReviewComment) => {
    setActiveCommentId(comment._id);
    if (comment.timestampSeconds !== undefined) {
      setCurrentTime(comment.timestampSeconds);
      captureReviewEvent("comment_seeked", { project_id: data.project._id });
    }
    if (comment.pinX !== undefined && comment.pinY !== undefined) {
      setActiveCommentId(comment._id);
    }
  };

  return (
    <div className="space-y-6">
      {header}
      <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {data.project.mediaType === "video" ? (
            <VideoPlayer
              src={data.project.mediaUrl}
              comments={videoMarkers}
              currentTime={currentTime}
              onTimeUpdate={setCurrentTime}
              onSeek={setCurrentTime}
            />
          ) : (
            <ImageReview
              src={data.project.mediaUrl}
              pins={imagePins}
              pendingPin={pendingPin}
              activePinId={activeCommentId}
              onImageClick={(pinX, pinY) => setPendingPin({ pinX, pinY })}
              onPinClick={setActiveCommentId}
            />
          )}
        </div>
        <CommentSidebar
          comments={data.comments}
          currentTime={currentTime}
          mediaType={data.project.mediaType}
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
