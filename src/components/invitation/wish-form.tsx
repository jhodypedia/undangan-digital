"use client";

import { submitWish } from "@/app/u/[slug]/actions";
import { ActionForm } from "@/components/forms/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function WishForm({
  invitationId,
  guestId,
  defaultName,
}: {
  invitationId: number;
  guestId?: number | null;
  defaultName?: string;
}) {
  return (
    <ActionForm action={submitWish} submitLabel="Kirim ucapan" className="space-y-4">
      <input type="hidden" name="invitationId" value={invitationId} />
      {guestId ? <input type="hidden" name="guestId" value={guestId} /> : null}
      <div className="space-y-2">
        <Label htmlFor="wish-name">Nama</Label>
        <Input id="wish-name" name="name" defaultValue={defaultName ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="wish-message">Ucapan & doa</Label>
        <Textarea id="wish-message" name="message" rows={3} required />
      </div>
    </ActionForm>
  );
}
