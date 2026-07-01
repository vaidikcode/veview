const comments = [
  {
    at: "00:04",
    who: "Maya R.",
    text: "Logo sting runs long — trim ~8 frames.",
    tone: "review",
  },
  { at: "00:11", who: "You", text: "Fixed in v3, pushing now.", tone: "me" },
  {
    at: "00:19",
    who: "Devin",
    text: "Color on the sky shot is 🔥 keep it.",
    tone: "review",
  },
];

export function ProductPreview() {
  return (
    <div className="glass glow-ring overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-2" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-3" />
        <span className="ml-3 font-mono text-[11px] text-muted-foreground">
          veview.app/r/9f2c…
        </span>
        <span className="ml-auto font-mono text-[11px] text-accent">● LIVE</span>
      </div>

      <div className="grid md:grid-cols-[1.4fr_1fr]">
        <div className="relative border-b border-border p-5 md:border-b-0 md:border-r">
          <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-[radial-gradient(120%_120%_at_20%_10%,rgba(123,108,255,0.35),transparent_55%),radial-gradient(120%_120%_at_90%_80%,rgba(255,106,44,0.35),transparent_55%),#0a0a0f]">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-border-strong bg-black/30 backdrop-blur">
                <span className="ml-1 h-0 w-0 border-y-8 border-l-[13px] border-y-transparent border-l-foreground" />
              </span>
            </div>
            <div className="absolute left-[26%] top-1/2 -translate-y-1/2">
              <span className="block h-3 w-3 rounded-full bg-accent shadow-[0_0_18px_2px_rgba(255,106,44,0.8)]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
              <span>00:04</span>
              <span>02:18</span>
            </div>
            <div className="relative mt-2 h-1.5 rounded-full bg-secondary">
              <div className="h-full w-[26%] rounded-full bg-gradient-to-r from-accent-2 to-accent" />
              <span className="absolute left-[26%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
            </div>
          </div>
        </div>

        <div className="space-y-2.5 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Thread
          </p>
          {comments.map((c) => (
            <div
              key={c.at}
              className="rounded-xl border border-border bg-secondary/50 p-3"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className={c.tone === "me" ? "text-accent" : "text-fg-dim"}>
                  {c.who}
                </span>
                <span className="font-mono text-muted-foreground">{c.at}</span>
              </div>
              <p className="mt-1 text-[13px] text-foreground/90">{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
