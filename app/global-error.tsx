"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    if (!posthog.__loaded) {
      posthog.init(key, {
        api_host: "/ingest",
        ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        capture_exceptions: false,
      });
    }

    posthog.captureException(error, {
      boundary: "global_error",
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0808",
          color: "#e6ddd4",
          fontFamily: "system-ui, sans-serif",
          padding: "1.25rem",
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#c24a2a",
            }}
          >
            Critical error
          </p>
          <h1 style={{ fontSize: "2rem", margin: "0.75rem 0" }}>Veview hit a wall.</h1>
          <p style={{ color: "#8f847a", maxWidth: 360, margin: "0 auto" }}>
            The error was reported. Reload to try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              border: "none",
              borderRadius: 999,
              background: "#c24a2a",
              color: "#f2e8df",
              padding: "0.7rem 1.4rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
