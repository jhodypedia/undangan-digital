"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";

import { useConfirm } from "@/components/feedback/confirm";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  action,
  hidden,
  label = "Hapus",
  confirmText = "Tindakan ini tidak bisa dibatalkan.",
  title,
  icon,
}: {
  action: (formData: FormData) => Promise<void>;
  hidden: Record<string, string | number>;
  label?: string;
  confirmText?: string;
  title?: string;
  icon?: React.ReactNode;
}) {
  const confirm = useConfirm();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={String(value)} />
      ))}
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className={label ? undefined : "px-2"}
        onClick={async () => {
          const ok = await confirm({
            title: title ?? (label === "Batalkan" ? "Batalkan transaksi?" : "Hapus data ini?"),
            description: confirmText,
            confirmLabel: label || "Hapus",
            tone: "danger",
          });
          if (ok) formRef.current?.requestSubmit();
        }}
      >
        {icon ?? <Trash2 className="size-3.5" />}
        {label}
      </Button>
    </form>
  );
}
