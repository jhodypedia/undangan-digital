"use client";

import { useRef } from "react";

import { useConfirm } from "@/components/feedback/confirm";
import { Button } from "@/components/ui/button";

type Tone = "danger" | "warning" | "default";

export function ConfirmButton({
  action,
  hidden = {},
  label,
  children,
  variant = "default",
  size = "default",
  tone = "default",
  title,
  description,
  confirmLabel,
  cancelLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  hidden?: Record<string, string | number>;
  label?: string;
  children?: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  tone?: Tone;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
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
        variant={variant}
        size={size}
        onClick={async () => {
          const ok = await confirm({
            title,
            description,
            confirmLabel: confirmLabel ?? label,
            cancelLabel,
            tone,
          });
          if (ok) formRef.current?.requestSubmit();
        }}
      >
        {children ?? label}
      </Button>
    </form>
  );
}
