"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createImage,
  getRotatedSize,
  jpegFileFromBlob,
  maxUploadBytes,
  renderImageToJpegBlob,
} from "@/lib/image-client";

const ASPECTS = [
  { label: "Bebas", value: 0 },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
];

export function ImageEditor({
  open,
  src,
  fileName = "foto.jpg",
  maxSizeMb = 10,
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  src: string | null;
  fileName?: string;
  maxSizeMb?: number;
  onOpenChange: (open: boolean) => void;
  onComplete: (file: File) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!src) {
      toast.error("Pilih foto terlebih dahulu.");
      return;
    }
    if (!croppedAreaPixels) {
      toast.error("Area potong belum siap. Tunggu foto selesai dimuat.");
      return;
    }

    setProcessing(true);
    try {
      const image = await createImage(src);
      const blob = await renderImageToJpegBlob(
        image,
        croppedAreaPixels,
        rotation,
        { maxBytes: maxUploadBytes(maxSizeMb) },
      );
      onComplete(jpegFileFromBlob(blob, fileName));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memproses foto. Coba lagi.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleWithoutCrop = async () => {
    if (!src) {
      toast.error("Pilih foto terlebih dahulu.");
      return;
    }

    setProcessing(true);
    try {
      const image = await createImage(src);
      const full = getRotatedSize(image.width, image.height, rotation);
      const blob = await renderImageToJpegBlob(
        image,
        { x: 0, y: 0, width: full.width, height: full.height },
        rotation,
        { maxBytes: maxUploadBytes(maxSizeMb) },
      );
      onComplete(jpegFileFromBlob(blob, fileName));
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal memproses foto. Coba lagi.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        key={src ?? "closed"}
        className="max-h-[92vh] max-w-3xl overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Edit foto</DialogTitle>
          <DialogDescription>
            Geser, zoom, putar, dan pilih rasio potong. Foto otomatis
            diperkecil dan dikompres sebelum diunggah.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-[42vh] min-h-[220px] max-h-[420px] w-full overflow-hidden rounded-xl bg-muted sm:h-[420px]">
          {src ? (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect === 0 ? undefined : aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              mediaProps={{
                onError: () =>
                  toast.error(
                    "Foto tidak bisa ditampilkan browser. Coba JPG, PNG, atau WEBP.",
                  ),
              }}
            />
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {ASPECTS.map((item) => (
              <Button
                key={item.label}
                type="button"
                size="xs"
                variant={aspect === item.value ? "default" : "outline"}
                onClick={() => setAspect(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setRotation((value) => (value - 90 + 360) % 360)}
            >
              Putar kiri
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setRotation((value) => (value + 90) % 360)}
            >
              Putar kanan
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleWithoutCrop}
            disabled={processing || !src}
          >
            Tanpa potong
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={processing || !src || !croppedAreaPixels}
          >
            {processing ? "Memproses..." : "Terapkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}