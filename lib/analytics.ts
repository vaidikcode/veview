"use client";

import posthog from "posthog-js";

export function captureProjectEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export function captureReviewEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
) {
  captureProjectEvent(event, properties);
}
