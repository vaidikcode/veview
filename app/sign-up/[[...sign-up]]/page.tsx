import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 50% at 30% 20%, rgba(123,108,255,0.25), transparent 60%)," +
            "radial-gradient(50% 50% at 80% 80%, rgba(255,106,44,0.22), transparent 60%)",
        }}
      />
      <div className="pointer-events-none absolute inset-0 hairline-grid opacity-30" />
      <header className="relative px-5 py-5">
        <Link href="/" data-cursor className="font-display text-lg tracking-tight">
          Veview
        </Link>
      </header>
      <main className="relative flex flex-1 items-center justify-center px-5 py-12">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
      </main>
    </div>
  );
}
