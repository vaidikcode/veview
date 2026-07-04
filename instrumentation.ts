import type { Instrumentation } from "next";

export async function register() {
  // Reserved for future server init. Exception capture uses onRequestError.
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { getPostHogServer } = await import("./lib/posthog-server");
  const posthog = getPostHogServer();
  if (!posthog) return;

  let distinctId: string | undefined;
  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    const cookieString = Array.isArray(cookieHeader)
      ? cookieHeader.join("; ")
      : cookieHeader;
    const match = cookieString.match(/ph_phc_.*?_posthog=([^;]+)/);
    if (match?.[1]) {
      try {
        const data = JSON.parse(decodeURIComponent(match[1])) as {
          distinct_id?: string;
        };
        distinctId = data.distinct_id;
      } catch {
        // Ignore malformed identity cookies.
      }
    }
  }

  const headers = request.headers as
    Headers | Record<string, string | string[] | undefined>;
  const readHeader = (name: string): string | undefined => {
    if (typeof (headers as Headers).get === "function") {
      return (headers as Headers).get(name) ?? undefined;
    }
    const value = (headers as Record<string, string | string[] | undefined>)[name];
    return Array.isArray(value) ? value[0] : value;
  };

  const sessionId =
    readHeader("x-posthog-session-id") ?? readHeader("X-POSTHOG-SESSION-ID");

  posthog.captureException(err, distinctId, {
    $session_id: sessionId,
    path: request.path,
    method: request.method,
    router_kind: context.routerKind,
    route_path: context.routePath,
    route_type: context.routeType,
  });

  await posthog.flush();
};
