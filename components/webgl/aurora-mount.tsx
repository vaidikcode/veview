"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

const Aurora = dynamic(() => import("./aurora"), { ssr: false });

function subscribe(callback: () => void) {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const width = window.matchMedia("(max-width: 640px)");
  motion.addEventListener("change", callback);
  width.addEventListener("change", callback);
  return () => {
    motion.removeEventListener("change", callback);
    width.removeEventListener("change", callback);
  };
}

function getSnapshot() {
  return (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !window.matchMedia("(max-width: 640px)").matches
  );
}

export function AuroraMount() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, () => false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 30% 20%, rgba(123,108,255,0.35), transparent 60%)," +
            "radial-gradient(50% 60% at 80% 40%, rgba(255,106,44,0.30), transparent 60%)," +
            "radial-gradient(70% 70% at 50% 90%, rgba(20,209,163,0.12), transparent 65%)," +
            "#07070a",
        }}
      />
      {enabled && <Aurora />}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,7,10,0) 40%, rgba(7,7,10,0.55) 78%, #07070a 100%)",
        }}
      />
    </div>
  );
}
