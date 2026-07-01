"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ShareLinkDialogProps = {
  shareToken: string;
  onCopy?: () => void;
};

export function ShareLinkDialog({ shareToken, onCopy }: ShareLinkDialogProps) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/r/${shareToken}`
      : `/r/${shareToken}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    onCopy?.();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="accent" size="sm">
          Share link
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Client link</DialogTitle>
          <DialogDescription>
            Anyone with this URL can leave notes — no sign-up required.
          </DialogDescription>
        </DialogHeader>
        <code className="mt-4 block break-all rounded-xl border border-border bg-secondary px-3 py-3 font-mono text-xs text-fg-dim">
          {url}
        </code>
        <Button className="mt-4 w-full" variant="accent" onClick={() => void copy()}>
          {copied ? "Copied to clipboard ✓" : "Copy link"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
