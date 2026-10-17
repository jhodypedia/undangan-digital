"use client";

import { useState } from "react";
import Image from "next/image";

import {
  addGallery,
  deleteAlbum,
  deleteEvent,
  deleteGallery,
  deleteGift,
  deleteStory,
  saveAlbum,
  saveEvent,
  saveGift,
  saveStory,
} from "@/app/dashboard/invitations/actions";
import { ActionForm } from "@/components/forms/action-form";
import { DeleteButton } from "@/components/forms/delete-button";
import {
  ImageUploader,
  MultiImageUploader,
} from "@/components/forms/image-uploader";
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
  GIFT_TYPES,
  GIFT_TYPE_LABELS,
  type GiftType,
} from "@/lib/constants";
import type {
  Album,
  Gallery,
  Gift,
  InvitationEvent,
  Story,
} from "@/db/schema";
import { formatDateTimeWIB } from "@/lib/time";

function ItemRow({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        {subtitle ? (
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function EventsManager({
  invitationId,
  items,
}: {
  invitationId: number;
  items: InvitationEvent[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada acara.</p>
        ) : (
          items.map((item) => (
            <ItemRow
              key={item.id}
              title={item.name}
              subtitle={`${formatDateTimeWIB(item.date)} · ${item.venue ?? "-"}`}
            >
              <div className="mt-2">
                <DeleteButton
                  action={deleteEvent}
                  hidden={{ id: item.id, invitationId }}
                />
              </div>
            </ItemRow>
          ))
        )}
      </div>
      <ActionForm action={saveEvent} submitLabel="Tambah acara" className="space-y-4">
        <input type="hidden" name="invitationId" value={invitationId} />
        <div className="space-y-2">
          <Label htmlFor="event-name">Nama acara</Label>
          <Input id="event-name" name="name" placeholder="Akad Nikah" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="event-date">Tanggal (WIB)</Label>
            <Input id="event-date" name="date" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-start">Mulai</Label>
            <Input id="event-start" name="startTime" type="time" defaultValue="09:00" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-end">Selesai</Label>
            <Input id="event-end" name="endTime" type="time" defaultValue="12:00" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-venue">Tempat</Label>
          <Input id="event-venue" name="venue" placeholder="Gedung Graha Wisata" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-address">Alamat</Label>
          <Textarea id="event-address" name="address" rows={2} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="event-maps">Tautan Maps</Label>
          <Input id="event-maps" name="mapsUrl" placeholder="https://maps.app.goo.gl/..." />
          <p className="text-xs text-muted-foreground">
            Tempel tautan Google Maps — koordinat di bawah terisi otomatis bila
            kosong.
          </p>
        </div>
        <UseLocationButton
          latId="event-lat"
          lngId="event-lng"
          addressId="event-address"
          locationNameId="event-venue"
          mapsUrlId="event-maps"
          label="Gunakan lokasi saya"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="event-lat">Latitude</Label>
            <Input id="event-lat" name="latitude" placeholder="-6.200000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-lng">Longitude</Label>
            <Input id="event-lng" name="longitude" placeholder="106.816666" />
          </div>
        </div>
      </ActionForm>
    </div>
  );
}

export function StoriesManager({
  invitationId,
  items,
}: {
  invitationId: number;
  items: Story[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada cerita.</p>
        ) : (
          items.map((item) => (
            <ItemRow
              key={item.id}
              title={item.title}
              subtitle={formatDateTimeWIB(item.storyDate)}
            >
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {item.description}
              </p>
              <div className="mt-2">
                <DeleteButton
                  action={deleteStory}
                  hidden={{ id: item.id, invitationId }}
                />
              </div>
            </ItemRow>
          ))
        )}
      </div>
      <ActionForm action={saveStory} submitLabel="Tambah cerita" className="space-y-4">
        <input type="hidden" name="invitationId" value={invitationId} />
        <div className="space-y-2">
          <Label htmlFor="story-title">Judul</Label>
          <Input id="story-title" name="title" placeholder="Pertemuan pertama" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="story-date">Tanggal (WIB)</Label>
            <Input id="story-date" name="storyDate" type="datetime-local" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="story-photo">URL foto</Label>
            <Input id="story-photo" name="photoUrl" placeholder="https://" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="story-desc">Deskripsi</Label>
          <Textarea id="story-desc" name="description" rows={3} />
        </div>
      </ActionForm>
    </div>
  );
}

export function GalleryManager({
  invitationId,
  items,
  albums,
  limit,
  maxMb = 5,
}: {
  invitationId: number;
  items: Gallery[];
  albums: Album[];
  limit: number;
  maxMb?: number;
}) {
  const atLimit = items.length >= limit;
  const remaining = Math.max(limit - items.length, 0);
  const [formKey, setFormKey] = useState(0);
  const albumName = (id: number | null) =>
    id ? albums.find((album) => album.id === id)?.name : undefined;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada foto.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-lg border">
                <Image
                  src={item.imageUrl}
                  alt={item.caption ?? "Galeri"}
                  width={400}
                  height={300}
                  className="aspect-4/3 w-full object-cover"
                  unoptimized
                />
                <div className="flex items-center justify-between gap-2 p-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      {item.caption ?? "-"}
                    </p>
                    {albumName(item.albumId) ? (
                      <p className="truncate text-[10px] text-muted-foreground">
                        Album: {albumName(item.albumId)}
                      </p>
                    ) : null}
                  </div>
                  <DeleteButton
                    action={deleteGallery}
                    hidden={{ id: item.id, invitationId }}
                    label=""
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ActionForm
        key={formKey}
        action={addGallery}
        submitLabel="Tambah foto"
        showSubmit={!atLimit}
        onSuccess={() => setFormKey((value) => value + 1)}
        className="space-y-4"
      >
        <input type="hidden" name="invitationId" value={invitationId} />
        <p className="text-xs text-muted-foreground">
          {items.length}/{limit} foto terpakai · bisa unggah beberapa sekaligus.
        </p>
        <div className="space-y-2">
          <Label>Foto</Label>
          <MultiImageUploader maxMb={maxMb} max={remaining} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gallery-caption">Keterangan</Label>
          <Input id="gallery-caption" name="caption" />
        </div>
        {albums.length > 0 ? (
          <div className="space-y-2">
            <Label htmlFor="gallery-album">Masukkan ke album (opsional)</Label>
            <Select name="albumId">
              <SelectTrigger id="gallery-album">
                <SelectValue placeholder="Galeri utama" />
              </SelectTrigger>
              <SelectContent>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={String(album.id)}>
                    {album.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}
        {atLimit ? (
          <p className="text-xs text-destructive">
            Batas galeri paket Anda sudah tercapai.
          </p>
        ) : null}
      </ActionForm>
    </div>
  );
}

function AlbumPhotosForm({
  invitationId,
  albumId,
  maxMb,
  remaining,
}: {
  invitationId: number;
  albumId: number;
  maxMb: number;
  remaining: number;
}) {
  const [formKey, setFormKey] = useState(0);
  if (remaining <= 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Kuota galeri penuh. Hapus beberapa foto di tab Galeri untuk menambah.
      </p>
    );
  }
  return (
    <ActionForm
      key={formKey}
      action={addGallery}
      submitLabel="Tambah foto"
      onSuccess={() => setFormKey((value) => value + 1)}
      className="space-y-3"
    >
      <input type="hidden" name="invitationId" value={invitationId} />
      <input type="hidden" name="albumId" value={albumId} />
      <p className="text-xs text-muted-foreground">
        Bisa unggah beberapa foto sekaligus ke album ini.
      </p>
      <MultiImageUploader maxMb={maxMb} max={remaining} />
    </ActionForm>
  );
}

export function AlbumManager({
  invitationId,
  items,
  photos,
  limit,
  maxMb = 5,
}: {
  invitationId: number;
  items: Album[];
  photos: Gallery[];
  limit: number;
  maxMb?: number;
}) {
  const remaining = Math.max(limit - photos.length, 0);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada album.</p>
        ) : (
          items.map((item) => {
            const count = photos.filter(
              (photo) => photo.albumId === item.id,
            ).length;
            return (
              <ItemRow
                key={item.id}
                title={item.name}
                subtitle={`${count} foto · ${item.isPublic ? "publik" : "privat"}`}
              >
                {item.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
                <div className="mt-2">
                  <DeleteButton
                    action={deleteAlbum}
                    hidden={{ id: item.id, invitationId }}
                  />
                </div>
                <details className="mt-3 w-full rounded-lg border bg-muted/20 p-3">
                  <summary className="cursor-pointer text-xs font-medium">
                    Tambah foto ke album ini
                  </summary>
                  <div className="mt-3">
                    <AlbumPhotosForm
                      invitationId={invitationId}
                      albumId={item.id}
                      maxMb={maxMb}
                      remaining={remaining}
                    />
                  </div>
                </details>
              </ItemRow>
            );
          })
        )}
      </div>
      <ActionForm action={saveAlbum} submitLabel="Tambah album" className="space-y-4">
        <input type="hidden" name="invitationId" value={invitationId} />
        <p className="text-xs text-muted-foreground">
          {photos.length}/{limit} foto terpakai · {remaining} slot tersisa.
        </p>
        <div className="space-y-2">
          <Label htmlFor="album-name">Nama album</Label>
          <Input id="album-name" name="name" placeholder="Sesi Prewedding" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="album-desc">Deskripsi</Label>
          <Textarea id="album-desc" name="description" rows={2} />
        </div>
        <div className="space-y-2">
          <Label>Sampul album</Label>
          <ImageUploader name="coverImage" maxMb={maxMb} />
        </div>
        <input type="hidden" name="isPublic" value="0" />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isPublic"
            value="1"
            defaultChecked
            className="size-4"
          />
          Tampilkan di undangan publik
        </label>
      </ActionForm>
    </div>
  );
}
export function GiftsManager({
  invitationId,
  items,
}: {
  invitationId: number;
  items: Gift[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada info hadiah.</p>
        ) : (
          items.map((item) => (
            <ItemRow
              key={item.id}
              title={GIFT_TYPE_LABELS[item.type]}
              subtitle={`${item.provider ?? item.accountName ?? ""} ${
                item.accountNumber ?? item.address ?? ""
              }`}
            >
              <div className="mt-2">
                <DeleteButton
                  action={deleteGift}
                  hidden={{ id: item.id, invitationId }}
                />
              </div>
            </ItemRow>
          ))
        )}
      </div>
      <ActionForm action={saveGift} submitLabel="Tambah info hadiah" className="space-y-4">
        <input type="hidden" name="invitationId" value={invitationId} />
        <div className="space-y-2">
          <Label htmlFor="gift-type">Jenis</Label>
          <Select name="type" defaultValue="bank">
            <SelectTrigger id="gift-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GIFT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {GIFT_TYPE_LABELS[type as GiftType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gift-provider">Bank / penyedia</Label>
            <Input id="gift-provider" name="provider" placeholder="Bank Mandiri" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gift-name">Nama pemilik</Label>
            <Input id="gift-name" name="accountName" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gift-number">Nomor rekening / e-wallet</Label>
          <Input id="gift-number" name="accountNumber" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gift-address">Alamat pengiriman hadiah</Label>
          <Textarea id="gift-address" name="address" rows={2} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublic" defaultChecked className="size-4" />
          Tampilkan di undangan publik
        </label>
      </ActionForm>
    </div>
  );
}
