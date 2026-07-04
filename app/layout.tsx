import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Suspense } from "react";
import { PostHogPageView, PostHogProvider } from "@posthog/next";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import { PostHogIdentifier } from "@/components/providers/posthog-identifier";
import { Cursor } from "@/components/motion/cursor";
import { clerkAppearance } from "@/lib/clerk-appearance";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: "Veview — client review, in motion", template: "%s · Veview" },
  description: "The review room for people who make things move.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${bricolage.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          appearance={clerkAppearance}
        >
          <ConvexClientProvider>
            <PostHogProvider
              apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
              clientOptions={{
                api_host: "/ingest",
                ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
              }}
            >
              <Cursor />
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              <PostHogIdentifier />
              {children}
            </PostHogProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
