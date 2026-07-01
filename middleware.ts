import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { postHogMiddleware } from "@posthog/next";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/r/(.*)",
  "/ingest(.*)",
]);

const posthogHandler = postHogMiddleware({
  proxy: { host: "https://eu.i.posthog.com" },
});

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  const { userId } = await auth();
  if (!userId) {
    const signIn = new URL("/sign-in", req.url);
    signIn.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signIn);
  }
});

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  // PostHog ingest proxy
  if (request.nextUrl.pathname.startsWith("/ingest")) {
    return posthogHandler(request);
  }

  const clerkResponse = await clerkHandler(request, event);
  if (clerkResponse) {
    return clerkResponse;
  }

  // Seed PostHog identity cookie on normal page loads
  const posthogResponse = await posthogHandler(request);
  return posthogResponse ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
