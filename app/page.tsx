import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ProductPreview } from "@/components/landing/product-preview";
import { SiteHeader } from "@/components/app-shell";
import { KineticText } from "@/components/motion/kinetic-text";
import { Magnetic } from "@/components/motion/magnetic";
import { RevealOnScroll } from "@/components/motion/reveal-on-scroll";
import { Button } from "@/components/ui/button";

const roles = [
  "video editors",
  "motion designers",
  "photographers",
  "3D artists",
  "colorists",
  "agencies",
  "illustrators",
  "producers",
];

const features = [
  {
    k: "01",
    title: "Frame-accurate notes",
    body: "Comments pin to a timestamp or an exact point on the image. No more “around the 30 second mark.”",
  },
  {
    k: "02",
    title: "One link, zero logins",
    body: "Clients open a URL and start marking up. Nothing to install, no account to create.",
  },
  {
    k: "03",
    title: "Video & stills",
    body: "Drop an MP4 or a JPG. Same review room, same shortcuts.",
  },
  {
    k: "04",
    title: "Live threads",
    body: "Feedback streams in the moment it lands, synced across everyone watching.",
  },
  {
    k: "05",
    title: "Approve & ship",
    body: "One tap moves a cut from in-review to approved.",
  },
];

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="relative">
      {/* Fixed bg — z-0 so it sits above body fill (negative z paints under it) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-[#0a0808] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/bg_landing.png)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black/55 via-black/45 to-[#0a0808]/70"
      />

      <div className="relative z-10">
        <SiteHeader />

        {/* HERO */}
        <section className="relative flex min-h-[100svh] flex-col justify-center px-5 pt-28 pb-16">
          <div className="relative mx-auto w-full max-w-5xl">
            <div className="mb-6 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-fg-dim">
              <span className="h-px w-8 bg-border-strong" />
              The review room for people who make things move
            </div>

            <h1 className="font-display text-[clamp(2.4rem,7.5vw,6.5rem)] leading-[0.95] text-white">
              <KineticText text="Feedback that" />
              <br />
              <KineticText text="hits the frame." startDelay={520} />
            </h1>

            <p className="mt-7 max-w-xl text-lg text-fg-dim">
              Upload a cut. Share one link. Collect precise, timestamped notes from
              clients who never have to sign up.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Button size="lg" variant="accent" asChild>
                  <Link href="/sign-up">Open a review room →</Link>
                </Button>
              </Magnetic>
              <Magnetic strength={0.25}>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/sign-in">Sign in</Link>
                </Button>
              </Magnetic>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            scroll
          </div>
        </section>

        {/* MARQUEE */}
        <section className="border-y border-border bg-background/50 py-6 backdrop-blur-[2px]">
          <div className="marquee">
            {[0, 1].map((dup) => (
              <div className="marquee__track" key={dup} aria-hidden={dup === 1}>
                {roles.map((role) => (
                  <span
                    key={role}
                    className="font-display text-3xl text-fg-dim md:text-4xl"
                  >
                    {role}
                    <span className="mx-8 text-accent">✳</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* PREVIEW */}
        <section className="relative px-5 py-24">
          <div className="mx-auto max-w-5xl">
            <RevealOnScroll className="mb-10 flex items-end justify-between gap-6">
              <h2 className="font-display text-4xl md:text-5xl">
                This is the whole tool.
              </h2>
              <p className="hidden max-w-xs text-sm text-fg-dim md:block">
                A player, a timeline, a thread. Nothing you have to learn.
              </p>
            </RevealOnScroll>
            <RevealOnScroll delay={120}>
              <ProductPreview />
            </RevealOnScroll>
          </div>
        </section>

        {/* FEATURES — editorial list, no cards */}
        <section className="px-5 pb-28">
          <div className="mx-auto max-w-5xl">
            <RevealOnScroll className="mb-12 md:mb-16">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">
                What you get
              </p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl md:text-5xl">
                Built for the last mile of a project.
              </h2>
            </RevealOnScroll>

            <div className="border-t border-border-strong">
              {features.map((f, i) => (
                <RevealOnScroll key={f.k} delay={i * 60}>
                  <article
                    data-cursor
                    className="group grid gap-3 border-b border-border py-8 transition-colors md:grid-cols-[5rem_1fr_1.1fr] md:items-baseline md:gap-10 md:py-10"
                  >
                    <span className="font-mono text-xs tracking-[0.18em] text-accent/80 transition-colors group-hover:text-accent">
                      {f.k}
                    </span>
                    <h3 className="font-display text-2xl leading-none tracking-tight md:text-3xl">
                      {f.title}
                    </h3>
                    <p className="max-w-md text-sm leading-relaxed text-fg-dim md:justify-self-end md:text-right">
                      {f.body}
                    </p>
                  </article>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden border-t border-border px-5 py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 120% at 50% 100%, rgba(194,74,42,0.16), transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="font-display text-[clamp(2.5rem,7vw,5rem)] leading-[0.95]">
              Send your next cut
              <br />
              <span className="text-gradient">the right way.</span>
            </h2>
            <div className="mt-10 flex justify-center">
              <Magnetic>
                <Button size="lg" variant="accent" asChild>
                  <Link href="/sign-up">Get started — it&apos;s free</Link>
                </Button>
              </Magnetic>
            </div>
          </div>
        </section>

        <footer className="border-t border-border px-5 py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between text-xs text-muted-foreground">
            <span className="font-display text-base text-foreground">Veview</span>
            <span className="font-mono">© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
