"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { createInvitation } from "@/app/dashboard/invitations/actions";
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
import { INVITATION_CATEGORIES, CATEGORY_LABELS } from "@/lib/constants";
import { wibNowInput } from "@/lib/time";

export function CreateInvitationDialog({ disabled }: { disabled?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>
          <Plus className="size-4" /> Undangan baru
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Buat undangan</DialogTitle>
          <DialogDescription>
            Isi informasi dasar. Detail lainnya bisa dilengkapi setelahnya.
          </DialogDescription>
        </DialogHeader>
        <ActionForm
          action={createInvitation}
          submitLabel="Buat undangan"
          onSuccess={() => setOpen(false)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Judul undangan</Label>
            <Input
              id="title"
              name="title"
              placeholder="Pernikahan Rani & Bima"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="groomName">Nama pria / pemilik acara</Label>
              <Input id="groomName" name="groomName" placeholder="Bima" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brideName">Nama wanita / pasangan</Label>
              <Input id="brideName" name="brideName" placeholder="Rani" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select name="category" defaultValue="pernikahan">
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INVITATION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {CATEGORY_LABELS[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate">Tanggal acara (WIB)</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="datetime-local"
                defaultValue={wibNowInput()}
              />
            </div>
          </div>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
