"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { emptyFormState, type FormState } from "@/lib/form-state";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;

export function ActionForm({
  action,
  children,
  className,
  submitLabel = "Simpan",
  pendingLabel,
  showSubmit = true,
  onSuccess,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  submitLabel?: string;
  pendingLabel?: string;
  showSubmit?: boolean;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, emptyFormState);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success(state.success);
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className={className}>
      {children}
      {showSubmit ? (
        <Button type="submit" disabled={pending} className="mt-4">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? (pendingLabel ?? submitLabel) : submitLabel}
        </Button>
      ) : null}
    </form>
  );
}
