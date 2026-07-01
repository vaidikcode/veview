import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { clerkAppearance } from "@/lib/clerk-appearance";

function Wordmark() {
  return (
    <span className="flex items-center gap-2 font-display text-lg tracking-tight">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_14px_1px_rgba(255,106,44,0.9)]" />
      Veview
    </span>
  );
}

type ShellProps = {
  children: React.ReactNode;
  cta?: { href: string; label: string };
};

export function AppShell({ children, cta }: ShellProps) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/dashboard" data-cursor>
            <Wordmark />
          </Link>
          <div className="flex items-center gap-3">
            {cta && (
              <Button size="sm" variant="accent" asChild>
                <Link href={cta.href}>{cta.label}</Link>
              </Button>
            )}
            <UserButton appearance={clerkAppearance} />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto mt-4 flex h-14 max-w-6xl items-center justify-between rounded-full border border-border bg-background/50 px-5 backdrop-blur-xl">
        <Link href="/" data-cursor>
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/sign-in"
            className="rounded-full px-4 py-2 text-fg-dim transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Button size="sm" variant="accent" asChild>
            <Link href="/sign-up">Get started</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
