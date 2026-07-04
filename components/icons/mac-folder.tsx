"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** macOS-style folder in Veview dull orange-red. */
export function MacFolderIcon({
  className,
  size = 64,
}: {
  className?: string;
  size?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const body = `${uid}-body`;
  const front = `${uid}-front`;
  const tab = `${uid}-tab`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 drop-shadow-[0_8px_16px_rgba(10,8,8,0.45)]", className)}
      aria-hidden
    >
      <path
        d="M2 12c0-3.3 2.7-6 6-6h14.2c1.5 0 2.9.7 3.8 1.9L29 12h27c3.3 0 6 2.7 6 6v26c0 3.3-2.7 6-6 6H8c-3.3 0-6-2.7-6-6V12Z"
        fill={`url(#${body})`}
      />
      <path
        d="M2 18h60v26c0 3.3-2.7 6-6 6H8c-3.3 0-6-2.7-6-6V18Z"
        fill={`url(#${front})`}
      />
      <path
        d="M8 6h14.2c1.5 0 2.9.7 3.8 1.9L29 12H8c-3.3 0-6-2.7-6-6 0 0 .5-0 6 0Z"
        fill={`url(#${tab})`}
      />
      <defs>
        <linearGradient
          id={body}
          x1="32"
          y1="6"
          x2="32"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C46A4A" />
          <stop offset="1" stopColor="#8A3D2C" />
        </linearGradient>
        <linearGradient
          id={front}
          x1="32"
          y1="18"
          x2="32"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#C24A2A" />
          <stop offset="1" stopColor="#6E2F22" />
        </linearGradient>
        <linearGradient
          id={tab}
          x1="16"
          y1="6"
          x2="16"
          y2="12"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#D4896A" />
          <stop offset="1" stopColor="#A85238" />
        </linearGradient>
      </defs>
    </svg>
  );
}
