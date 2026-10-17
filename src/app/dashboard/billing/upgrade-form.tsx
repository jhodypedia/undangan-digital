"use client";

import { requestUpgrade } from "@/app/dashboard/billing/actions";
import { ActionForm } from "@/components/forms/action-form";
import { Button } from "@/components/ui/button";

export function UpgradeForm({
  planCode,
  label,
  disabled,
}: {
  planCode: string;
  label: string;
  disabled?: boolean;
}) {
  return (
    <ActionForm
      action={requestUpgrade}
      showSubmit={false}
      submitLabel={label}
      className="mt-4"
    >
      <input type="hidden" name="planCode" value={planCode} />
      <Button type="submit" className="w-full" disabled={disabled}>
        {label}
      </Button>
    </ActionForm>
  );
}
