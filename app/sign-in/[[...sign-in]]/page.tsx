import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 50% at 30% 20%, rgba(138,61,44,0.2), transparent 60%)," +
            "radial-gradient(50% 50% at 80% 80%, rgba(194,74,42,0.16), transparent 60%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 hairline-grid opacity-30" />
      <header className="relative px-5 py-5">
        <Link href="/" data-cursor className="font-display text-lg tracking-tight">
          Veview
        </Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-5 py-12">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
      </main>
    </div>
  );
}
