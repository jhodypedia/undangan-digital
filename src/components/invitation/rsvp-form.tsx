"use client";

import { submitRsvp } from "@/app/u/[slug]/actions";
import { ActionForm } from "@/components/forms/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ATTENDANCE_LABELS, ATTENDANCE_OPTIONS } from "@/lib/constants";

export function RsvpForm({
  invitationId,
  guestId,
  defaultName,
}: {
  invitationId: number;
  guestId?: number | null;
  defaultName?: string;
}) {
  return (
    <ActionForm action={submitRsvp} submitLabel="Kirim konfirmasi" className="space-y-4">
      <input type="hidden" name="invitationId" value={invitationId} />
      {guestId ? <input type="hidden" name="guestId" value={guestId} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rsvp-name">Nama</Label>
          <Input id="rsvp-name" name="name" defaultValue={defaultName ?? ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rsvp-phone">No. WhatsApp</Label>
          <Input id="rsvp-phone" name="phone" placeholder="0812..." />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rsvp-attendance">Kehadiran</Label>
          <Select name="attendance" defaultValue="hadir">
            <SelectTrigger id="rsvp-attendance">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTENDANCE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {ATTENDANCE_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rsvp-total">Jumlah orang</Label>
          <Input
            id="rsvp-total"
            name="totalGuests"
            type="number"
            min={1}
            defaultValue={1}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rsvp-message">Pesan (opsional)</Label>
        <Textarea id="rsvp-message" name="message" rows={2} />
      </div>
    </ActionForm>
  );
}
