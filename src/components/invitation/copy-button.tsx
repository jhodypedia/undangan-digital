"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  label = "Salin",
}: {
  value: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors hover:bg-black/5"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Tersalin" : label}
    </button>
  );
}
