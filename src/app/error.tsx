"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-2xl">Terjadi kesalahan</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {error?.message || "Halaman tidak dapat dimuat."}
      </p>
      {error?.digest ? (
        <p className="text-xs text-muted-foreground">Kode: {error.digest}</p>
      ) : null}
      <Button onClick={reset}>Muat ulang</Button>
    </div>
  );
}