"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function UseLocationButton({
  latId,
  lngId,
  addressId,
  locationNameId,
  mapsUrlId,
  label = "Gunakan lokasi saya",
}: {
  latId: string;
  lngId: string;
  addressId?: string;
  locationNameId?: string;
  mapsUrlId?: string;
  label?: string;
}) {
  const [pending, setPending] = useState(false);

  const setValue = (id: string | undefined, value: string) => {
    if (!id) return;
    const node = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
    if (node) node.value = value;
  };

  const handleClick = () => {
    if (!navigator.geolocation) {
      toast.error("Perangkat tidak mendukung geolokasi.");
      return;
    }
    setPending(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setValue(latId, latitude.toFixed(6));
        setValue(lngId, longitude.toFixed(6));
        setValue(
          mapsUrlId,
          `https://www.google.com/maps?q=${latitude},${longitude}`,
        );

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=id`,
            { headers: { "Accept-Language": "id" } },
          );
          if (response.ok) {
            const data = (await response.json()) as {
              display_name?: string;
              name?: string;
              address?: Record<string, string>;
            };
            if (data.display_name) setValue(addressId, data.display_name);
            const name =
              data.name ||
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              "";
            if (name) setValue(locationNameId, name);
          }
        } catch {
          // ignore reverse geocode failures
        }

        setPending(false);
        toast.success("Lokasi berhasil diambil.");
      },
      (error) => {
        setPending(false);
        toast.error(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan di pengaturan browser."
            : "Gagal mengambil lokasi.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <MapPin className="size-4" />
      )}
      {label}
    </Button>
  );
}