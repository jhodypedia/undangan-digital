"use client";

import { changePassword, updateProfile } from "@/app/dashboard/settings/actions";
import { ActionForm } from "@/components/forms/action-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  name,
  phone,
  companyName,
  avatarUrl,
}: {
  name: string;
  phone: string | null;
  companyName: string | null;
  avatarUrl: string | null;
}) {
  return (
    <ActionForm action={updateProfile} submitLabel="Simpan profil" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama lengkap</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">No. WhatsApp</Label>
          <Input id="phone" name="phone" defaultValue={phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Nama penyelenggara / WO</Label>
          <Input id="companyName" name="companyName" defaultValue={companyName ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatarUrl">URL foto profil</Label>
        <Input id="avatarUrl" name="avatarUrl" defaultValue={avatarUrl ?? ""} placeholder="https://" />
      </div>
    </ActionForm>
  );
}

export function PasswordForm() {
  return (
    <ActionForm action={changePassword} submitLabel="Ubah kata sandi" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Kata sandi saat ini</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newPassword">Kata sandi baru</Label>
          <Input id="newPassword" name="newPassword" type="password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Ulangi kata sandi baru</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
        </div>
      </div>
    </ActionForm>
  );
}
