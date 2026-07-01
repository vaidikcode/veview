"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type ImagePin = { id: string; pinX: number; pinY: number };

type ImageReviewProps = {
  src: string;
  pins: ImagePin[];
  pendingPin?: { pinX: number; pinY: number } | null;
  onImageClick?: (pinX: number, pinY: number) => void;
  onPinClick?: (id: string) => void;
  activePinId?: string | null;
};

export function ImageReview({
  src,
  pins,
  pendingPin,
  onImageClick,
  onPinClick,
  activePinId,
}: ImageReviewProps) {
  const [scale, setScale] = useState(1);

  return (
    <div className="space-y-2">
      <div className="flex justify-end gap-2 font-mono text-xs text-muted-foreground">
        <button
          type="button"
          className="px-2 hover:text-foreground"
          onClick={() => setScale((s) => Math.max(1, s - 0.25))}
        >
          −
        </button>
        <span>{Math.round(scale * 100)}%</span>
        <button
          type="button"
          className="px-2 hover:text-foreground"
          onClick={() => setScale((s) => Math.min(3, s + 0.25))}
        >
          +
        </button>
      </div>
      <div className="overflow-auto rounded-lg border border-border bg-[#111]">
        <div className="origin-top-left" style={{ transform: `scale(${scale})` }}>
          <button
            type="button"
            className="relative block w-full"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onImageClick?.(
                (e.clientX - rect.left) / rect.width,
                (e.clientY - rect.top) / rect.height,
              );
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full object-contain" />
            {pins.map((pin) => (
              <span
                key={pin.id}
                className={cn(
                  "absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-foreground",
                  activePinId === pin.id && "ring-2 ring-white/40",
                )}
                style={{ left: `${pin.pinX * 100}%`, top: `${pin.pinY * 100}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPinClick?.(pin.id);
                }}
              />
            ))}
            {pendingPin && (
              <span
                className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border-2 border-white bg-white/60"
                style={{
                  left: `${pendingPin.pinX * 100}%`,
                  top: `${pendingPin.pinY * 100}%`,
                }}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
