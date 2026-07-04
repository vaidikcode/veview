import { PostHog } from "posthog-node";

let client: PostHog | null = null;

/**
 * Server-side PostHog client for exception capture (instrumentation, RSC, etc.).
 * Uses the EU ingest host to match the browser proxy.
 */
export function getPostHogServer(): PostHog | null {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;

  if (!client) {
    client = new PostHog(apiKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return client;
}
