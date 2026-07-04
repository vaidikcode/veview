"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatTimestamp } from "@/lib/utils";

export type VideoCommentMarker = { id: string; timestampSeconds: number };

type VideoPlayerProps = {
  src: string;
  comments: VideoCommentMarker[];
  currentTime?: number;
  onTimeUpdate?: (time: number) => void;
  onSeek?: (time: number) => void;
};

export function VideoPlayer({
  src,
  comments,
  onTimeUpdate,
  onSeek,
  currentTime,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [localTime, setLocalTime] = useState(0);
  const [seeking, setSeeking] = useState(false);

  const time = currentTime ?? localTime;

  const seekTo = useCallback(
    (t: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = t;
      setLocalTime(t);
      onSeek?.(t);
    },
    [onSeek],
  );

  useEffect(() => {
    if (currentTime === undefined) return;
    const v = videoRef.current;
    if (!v || seeking) return;
    if (Math.abs(v.currentTime - currentTime) > 0.3) {
      v.currentTime = currentTime;
      setLocalTime(currentTime);
    }
  }, [currentTime, seeking]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#111]">
      <video
        ref={videoRef}
        src={src}
        className="aspect-video w-full object-contain"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          if (!seeking) {
            setLocalTime(e.currentTarget.currentTime);
            onTimeUpdate?.(e.currentTarget.currentTime);
          }
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onClick={togglePlay}
      />
      <div className="border-t border-white/10 px-4 py-3">
        <div className="relative mb-3 h-1.5 rounded-full bg-white/15">
          {duration > 0 &&
            comments.map((c) => (
              <button
                key={c.id}
                type="button"
                className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_1px_rgba(194,74,42,0.45)]"
                style={{ left: `${(c.timestampSeconds / duration) * 100}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  seekTo(c.timestampSeconds);
                }}
                aria-label={`Comment at ${formatTimestamp(c.timestampSeconds)}`}
              />
            ))}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={time}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange={(e) => {
              setSeeking(true);
              seekTo(Number(e.target.value));
            }}
            onMouseUp={() => setSeeking(false)}
            onTouchEnd={() => setSeeking(false)}
          />
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-2 to-accent"
            style={{ width: duration ? `${(time / duration) * 100}%` : "0%" }}
          />
        </div>
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="font-mono text-xs text-white hover:bg-white/10"
              onClick={togglePlay}
            >
              {playing ? "Pause" : "Play"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="font-mono text-xs text-white hover:bg-white/10"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.muted = !v.muted;
                setMuted(v.muted);
              }}
            >
              {muted ? "Unmute" : "Mute"}
            </Button>
            <span className="font-mono text-xs tabular-nums text-white/70">
              {formatTimestamp(time)}
              {duration > 0 ? ` / ${formatTimestamp(duration)}` : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
