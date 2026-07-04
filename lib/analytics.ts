"use client";

import posthog from "posthog-js";

function canCapture() {
  return typeof window !== "undefined" && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);
}

export function captureProjectEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
) {
  if (!canCapture()) return;
  posthog.capture(event, properties);
}

export function captureReviewEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
) {
  captureProjectEvent(event, properties);
}

/** Report a handled exception to PostHog Error Tracking. */
export function captureAppException(
  error: unknown,
  properties?: Record<string, string | number | boolean | null | undefined>,
) {
  if (!canCapture()) return;
  posthog.captureException(error, properties);
}
