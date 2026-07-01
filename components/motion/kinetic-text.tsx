import { cn } from "@/lib/utils";

type KineticTextProps = {
  text: string;
  className?: string;
  startDelay?: number;
  stagger?: number;
};

export function KineticText({
  text,
  className,
  startDelay = 0,
  stagger = 55,
}: KineticTextProps) {
  const words = text.split(" ");
  const wordData = words.map((word, wi) => ({
    word,
    start: words.slice(0, wi).reduce((sum, w) => sum + w.length, 0),
  }));

  return (
    <span className={cn("inline", className)}>
      {wordData.map(({ word, start }, wi) => (
        <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap">
          {word.split("").map((char, ci) => (
            <span
              key={`${char}-${ci}`}
              className="rise"
              style={
                {
                  "--rise-delay": `${startDelay + (start + ci) * stagger}ms`,
                } as React.CSSProperties
              }
            >
              {char}
            </span>
          ))}
          {wi < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
