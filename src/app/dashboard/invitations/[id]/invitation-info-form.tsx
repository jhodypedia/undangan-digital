"use client";

import { updateInvitation } from "@/app/dashboard/invitations/actions";
import { ActionForm } from "@/components/forms/action-form";
import { ImageUploader } from "@/components/forms/image-uploader";
import { UseLocationButton } from "@/components/forms/use-location-button";
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
  CATEGORY_LABELS,
  INVITATION_CATEGORIES,
  type InvitationCategory,
} from "@/lib/constants";
import type { Invitation } from "@/db/schema";
import { toWIBDateTimeInput } from "@/lib/time";

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border p-4">
      <h3 className="font-display text-lg">{title}</h3>
      {children}
    </section>
  );
}

export function InvitationInfoForm({
  invitation,
  maxMb = 5,
  showSubmit = true,
  onSuccess,
}: {
  invitation: Invitation;
  maxMb?: number;
  showSubmit?: boolean;
  onSuccess?: () => void;
}) {
  return (
    <ActionForm
      action={updateInvitation}
      submitLabel="Simpan perubahan"
      showSubmit={showSubmit}
      onSuccess={onSuccess}
      className="space-y-5"
    >
      <input type="hidden" name="id" value={invitation.id} />

      <Section title="Informasi dasar">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Judul undangan" name="title" defaultValue={invitation.title} />
          <Field
            label="Slug tautan"
            name="slug"
            defaultValue={invitation.slug}
            placeholder="rani-bima"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select
              name="category"
              defaultValue={invitation.category as InvitationCategory}
            >
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
          <Field
            label="Tanggal acara utama (WIB)"
            name="eventDate"
            type="datetime-local"
            defaultValue={
              invitation.eventDate
                ? toWIBDateTimeInput(invitation.eventDate)
                : ""
            }
          />
        </div>
      </Section>

      <Section title="Mempelai pria / pemilik acara">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama panggilan" name="groomName" defaultValue={invitation.groomName} />
          <Field label="Nama lengkap" name="groomFullName" defaultValue={invitation.groomFullName} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Putra ke-" name="groomOrder" defaultValue={invitation.groomOrder} />
          <Field label="Instagram" name="groomInstagram" defaultValue={invitation.groomInstagram} />
        </div>
        <Field label="Orang tua" name="groomParents" defaultValue={invitation.groomParents} />
        <div className="space-y-2">
          <Label>Foto mempelai pria</Label>
          <ImageUploader
            name="groomPhoto"
            defaultValue={invitation.groomPhoto ?? ""}
            maxMb={maxMb}
          />
        </div>
      </Section>

      <Section title="Mempelai wanita / pasangan">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama panggilan" name="brideName" defaultValue={invitation.brideName} />
          <Field label="Nama lengkap" name="brideFullName" defaultValue={invitation.brideFullName} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Putri ke-" name="brideOrder" defaultValue={invitation.brideOrder} />
          <Field label="Instagram" name="brideInstagram" defaultValue={invitation.brideInstagram} />
        </div>
        <Field label="Orang tua" name="brideParents" defaultValue={invitation.brideParents} />
        <div className="space-y-2">
          <Label>Foto mempelai wanita</Label>
          <ImageUploader
            name="bridePhoto"
            defaultValue={invitation.bridePhoto ?? ""}
            maxMb={maxMb}
          />
        </div>
      </Section>

      <Section title="Kutipan & sambutan">
        <div className="space-y-2">
          <Label htmlFor="quote">Kutipan</Label>
          <Textarea id="quote" name="quote" defaultValue={invitation.quote ?? ""} rows={3} />
        </div>
        <Field label="Sumber kutipan" name="quoteSource" defaultValue={invitation.quoteSource} />
        <div className="space-y-2">
          <Label htmlFor="greeting">Kata sambutan</Label>
          <Textarea id="greeting" name="greeting" defaultValue={invitation.greeting ?? ""} rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="closing">Penutup</Label>
          <Textarea id="closing" name="closing" defaultValue={invitation.closing ?? ""} rows={3} />
        </div>
      </Section>

      <Section title="Foto sampul">
        <p className="text-xs text-muted-foreground">
          Foto berbentuk potret yang ditampilkan di atas tulisan
          &quot;The Wedding Of&quot; pada halaman sampul undangan. Kosongkan
          untuk memakai monogram inisial.
        </p>
        <div className="space-y-2">
          <Label>Foto pembuka (di atas &quot;The Wedding Of&quot;)</Label>
          <ImageUploader
            name="coverPhoto"
            defaultValue={invitation.coverPhoto ?? ""}
            maxMb={maxMb}
          />
        </div>
        <div className="space-y-2">
          <Label>Foto latar sampul (background)</Label>
          <p className="text-xs text-muted-foreground">
            Hanya untuk halaman sampul sebelum undangan dibuka. Pada tema
            dengan artwork, foto ini menjadi cadangan foto di dalam bingkai
            bila foto pembuka kosong. Untuk latar setelah undangan dibuka,
            atur di tab <strong>Desain</strong>.
          </p>
          <ImageUploader
            name="coverImage"
            defaultValue={invitation.coverImage ?? ""}
            maxMb={maxMb}
          />
        </div>
      </Section>

      <Section title="Lokasi & media">
        <Field label="Nama lokasi" name="locationName" defaultValue={invitation.locationName} />
        <div className="space-y-2">
          <Label htmlFor="address">Alamat lengkap</Label>
          <Textarea id="address" name="address" defaultValue={invitation.address ?? ""} rows={2} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tautan Google Maps" name="mapsUrl" defaultValue={invitation.mapsUrl} placeholder="https://maps.app.goo.gl/..." />
          <Field label="Tautan live streaming" name="liveStreamUrl" defaultValue={invitation.liveStreamUrl} />
        </div>
        <UseLocationButton
          latId="latitude"
          lngId="longitude"
          addressId="address"
          locationNameId="locationName"
          mapsUrlId="mapsUrl"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Latitude" name="latitude" defaultValue={invitation.latitude} placeholder="-6.200000" />
          <Field label="Longitude" name="longitude" defaultValue={invitation.longitude} placeholder="106.816666" />
        </div>
        <p className="text-xs text-muted-foreground">
          Koordinat opsional. Kosongkan agar otomatis diambil dari tautan Google
          Maps saat disimpan.
        </p>
        <Field label="URL musik latar" name="musicUrl" defaultValue={invitation.musicUrl} placeholder="https://" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Warna utama" name="themeColor" type="color" defaultValue={invitation.themeColor} />
          <Field label="Warna aksen" name="accentColor" type="color" defaultValue={invitation.accentColor} />
        </div>
      </Section>

      <Section title="Batas RSVP">
        <Field
          label="Tenggat konfirmasi kehadiran (WIB)"
          name="rsvpDeadline"
          type="datetime-local"
          defaultValue={
            invitation.rsvpDeadline
              ? toWIBDateTimeInput(invitation.rsvpDeadline)
              : ""
          }
        />
      </Section>
    </ActionForm>
  );
}
