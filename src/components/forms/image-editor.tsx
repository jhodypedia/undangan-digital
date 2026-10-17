"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ASPECTS = [
  { label: "Bebas", value: 0 },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "3:4", value: 3 / 4 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
];

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.crossOrigin = "anonymous";
    image.src = url;
  });
}

function getRotatedSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width:
      Math.abs(width * Math.cos(rotRad)) +
      Math.abs(height * Math.sin(rotRad)),
    height:
      Math.abs(width * Math.sin(rotRad)) +
      Math.abs(height * Math.cos(rotRad)),
  };
}

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation: number,
  mime = "image/jpeg",
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia.");

  const rotRad = (rotation * Math.PI) / 180;
  const { width: bBoxWidth, height: bBoxHeight } = getRotatedSize(
    image.width,
    image.height,
    rotation,
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  );

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.putImageData(data, 0, 0);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Gagal membuat gambar."));
      },
      mime,
      0.92,
    );
  });
}

export function ImageEditor({
  open,
  src,
  fileName = "foto.jpg",
  onOpenChange,
  onComplete,
}: {
  open: boolean;
  src: string | null;
  fileName?: string;
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
    if (!src || !croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedBlob(src, croppedAreaPixels, rotation);
      const file = new File([blob], fileName.replace(/\.[^.]+$/, ".jpg"), {
        type: "image/jpeg",
      });
      onComplete(file);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={src ?? "closed"} className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">Edit foto</DialogTitle>
          <DialogDescription>
            Geser, zoom, putar, dan pilih rasio potong. Hasil akan disimpan.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-muted">
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

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={processing}
          >
            Batal
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={processing}>
            {processing ? "Memproses..." : "Terapkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}