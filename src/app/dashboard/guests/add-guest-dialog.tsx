"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { createGuest } from "@/app/dashboard/guests/actions";
import { ActionForm } from "@/components/forms/action-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  GUEST_CATEGORIES,
  GUEST_CATEGORY_LABELS,
} from "@/lib/constants";

export function AddGuestDialog({
  invitations,
}: {
  invitations: { id: number; title: string }[];
}) {
  const [open, setOpen] = useState(false);
  const disabled = invitations.length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <UserPlus className="size-4" /> Tambah tamu
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Tambah tamu</DialogTitle>
          <DialogDescription>
            Setiap tamu mendapat tautan undangan pribadi.
          </DialogDescription>
        </DialogHeader>
        <ActionForm
          action={createGuest}
          submitLabel="Simpan tamu"
          onSuccess={() => setOpen(false)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="guest-invitation">Undangan</Label>
            <Select name="invitationId" defaultValue={String(invitations[0]?.id)}>
              <SelectTrigger id="guest-invitation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {invitations.map((invitation) => (
                  <SelectItem key={invitation.id} value={String(invitation.id)}>
                    {invitation.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guest-name">Nama tamu</Label>
              <Input id="guest-name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-phone">No. WhatsApp</Label>
              <Input id="guest-phone" name="phone" placeholder="0812..." />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="guest-email">Email</Label>
              <Input id="guest-email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guest-category">Kategori</Label>
              <Select name="category" defaultValue="lainnya">
                <SelectTrigger id="guest-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GUEST_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {GUEST_CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-address">Alamat</Label>
            <Input id="guest-address" name="address" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guest-message">Pesan pribadi (opsional)</Label>
            <Textarea id="guest-message" name="personalMessage" rows={2} />
          </div>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
