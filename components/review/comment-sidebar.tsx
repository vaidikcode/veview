"use client";

import { useState } from "react";
import { captureAppException } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatRelativeTime, formatTimestamp } from "@/lib/utils";

export type ReviewComment = {
  _id: string;
  text: string;
  timestampSeconds?: number;
  pinX?: number;
  pinY?: number;
  authorType: "creator" | "guest";
  authorDisplayName: string;
  createdAt: number;
};

type CommentSidebarProps = {
  comments: ReviewComment[];
  currentTime?: number;
  mediaType?: "video" | "image";
  displayName: string;
  onDisplayNameChange: (name: string) => void;
  onSubmit: (text: string) => Promise<void>;
  onSelectComment: (comment: ReviewComment) => void;
  activeCommentId?: string | null;
  now: number;
};

export function CommentSidebar({
  comments,
  currentTime,
  mediaType,
  displayName,
  onDisplayNameChange,
  onSubmit,
  onSelectComment,
  activeCommentId,
  now,
}: CommentSidebarProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!displayName.trim()) {
      setError("Enter your name");
      return;
    }
    if (!text.trim()) {
      setError("Write a comment");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText("");
    } catch (e) {
      captureAppException(e, {
        context: "comment_submit",
        media_type: mediaType ?? "unknown",
      });
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="flex h-full min-h-[420px] flex-col rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium">Comments</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {mediaType === "video"
            ? "Pause and comment at the playhead"
            : "Click the image to place a pin"}
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {comments.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No comments yet
          </p>
        ) : (
          comments.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => onSelectComment(c)}
              className={cn(
                "w-full rounded-md border p-3 text-left text-sm transition-colors",
                activeCommentId === c._id
                  ? "border-foreground/25 bg-background"
                  : "border-border bg-background hover:border-foreground/15",
              )}
            >
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>
                  {c.authorDisplayName}
                  {c.authorType === "creator" && " · you"}
                </span>
                <span>{formatRelativeTime(c.createdAt, now)}</span>
              </div>
              {c.timestampSeconds !== undefined && (
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {formatTimestamp(c.timestampSeconds)}
                </p>
              )}
              <p className="mt-1">{c.text}</p>
            </button>
          ))
        )}
      </div>

      <div className="space-y-2 border-t border-border p-4">
        {!displayName && (
          <Input
            placeholder="Your name"
            value={displayName}
            onChange={(e) => onDisplayNameChange(e.target.value)}
          />
        )}
        <Textarea
          placeholder={
            mediaType === "video"
              ? `Comment at ${formatTimestamp(currentTime ?? 0)}`
              : "Your feedback…"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[72px]"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          size="sm"
          className="w-full"
          disabled={submitting}
          onClick={() => void submit()}
        >
          {submitting ? "Posting…" : "Post comment"}
        </Button>
      </div>
    </aside>
  );
}
