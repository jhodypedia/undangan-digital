"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  Crop,
  ImagePlus,
  Loader2,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { uploadImageAction } from "@/app/dashboard/invitations/actions";
import { Button } from "@/components/ui/button";
import { ImageEditor } from "@/components/forms/image-editor";
import { cn } from "@/lib/utils";

export function ImageUploader({
  name,
  defaultValue = "",
  maxMb = 5,
  className,
  value: controlledValue,
  onChange,
}: {
  name: string;
  defaultValue?: string;
  maxMb?: number;
  className?: string;
  value?: string;
  onChange?: (url: string) => void;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const url = controlledValue ?? internal;
  const setUrl = (next: string) => {
    if (controlledValue === undefined) setInternal(next);
    onChange?.(next);
  };
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [editorFile, setEditorFile] = useState<File | null>(null);

  const uploadFile = (file: File) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction({}, formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.success) {
        setUrl(result.success);
        toast.success("Foto berhasil diunggah.");
      }
    });
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Format harus JPG, PNG, atau WEBP.");
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Ukuran maksimal ${maxMb} MB.`);
      return;
    }
    setEditorFile(file);
    setEditorSrc(URL.createObjectURL(file));
    setEditorOpen(true);
  };

  const handleCropComplete = (cropped: File) => {
    if (editorSrc) URL.revokeObjectURL(editorSrc);
    setEditorSrc(null);
    setEditorFile(null);
    uploadFile(cropped);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={url} />
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30",
        )}
      >
        {url ? (
          <div className="relative w-full">
            <Image
              src={url}
              alt="Pratinjau"
              width={640}
              height={360}
              unoptimized
              className="mx-auto max-h-56 w-auto rounded-lg object-contain"
            />
            <div className="mt-3 flex justify-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => inputRef.current?.click()}
              >
                <ImagePlus className="size-4" /> Ganti
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setUrl("")}
              >
                <Trash2 className="size-4" /> Hapus
              </Button>
            </div>
          </div>
        ) : (
          <>
            <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
              {pending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <UploadCloud className="size-5" />
              )}
            </span>
            <p className="text-sm font-medium">
              Tarik foto ke sini atau pilih berkas
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, atau WEBP · maksimal {maxMb} MB
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => inputRef.current?.click()}
            >
              {pending ? "Mengunggah..." : "Pilih foto"}
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      <ImageEditor
        open={editorOpen}
        src={editorSrc}
        fileName={editorFile?.name ?? "foto.jpg"}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open && editorSrc) {
            URL.revokeObjectURL(editorSrc);
            setEditorSrc(null);
            setEditorFile(null);
          }
        }}
        onComplete={handleCropComplete}
      />
    </div>
  );
}

export function MultiImageUploader({
  name = "imageUrl",
  maxMb = 5,
  max = 20,
  className,
}: {
  name?: string;
  maxMb?: number;
  max?: number;
  className?: string;
}) {
  const [urls, setUrls] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted = Array.from(files).filter((file) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name}: format harus JPG, PNG, atau WEBP.`);
        return false;
      }
      if (file.size > maxMb * 1024 * 1024) {
        toast.error(`${file.name}: melebihi ${maxMb} MB.`);
        return false;
      }
      return true;
    });
    if (accepted.length === 0) return;

    const room = max - urls.length;
    const queue = accepted.slice(0, Math.max(room, 0));
    if (queue.length < accepted.length) {
      toast.error(`Maksimal ${max} foto sekaligus.`);
    }
    if (queue.length === 0) return;

    setPending(true);
    setProgress({ done: 0, total: queue.length });
    let uploaded = 0;
    for (const file of queue) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImageAction({}, formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        const url = result.success;
        setUrls((prev) => [...prev, url]);
        uploaded += 1;
      }
      setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }
    setPending(false);
    if (uploaded > 0) {
      toast.success(`${uploaded} foto berhasil diunggah.`);
    }
  };

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorSrc, setEditorSrc] = useState<string | null>(null);
  const [editorFile, setEditorFile] = useState<File | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const startEdit = async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], `foto-${index + 1}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      setEditorFile(file);
      setEditorSrc(URL.createObjectURL(file));
      setEditingIndex(index);
      setEditorOpen(true);
    } catch {
      toast.error("Gagal memuat foto untuk diedit.");
    }
  };

  const handleCropCompleteMulti = async (cropped: File) => {
    if (editingIndex === null) return;
    const formData = new FormData();
    formData.append("file", cropped);
    const result = await uploadImageAction({}, formData);
    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      setUrls((prev) =>
        prev.map((item, idx) =>
          idx === editingIndex ? result.success! : item,
        ),
      );
      toast.success("Foto diperbarui.");
    }
    if (editorSrc) URL.revokeObjectURL(editorSrc);
    setEditorSrc(null);
    setEditorFile(null);
    setEditingIndex(null);
    setEditorOpen(false);
  };

  const remaining = max - urls.length;

  return (
    <div className={cn("space-y-2", className)}>
      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      {urls.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {urls.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-lg border"
            >
              <Image
                src={url}
                alt="Pratinjau"
                width={200}
                height={200}
                unoptimized
                className="size-full object-cover"
              />
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => startEdit(url, urls.indexOf(url))}
                  className="grid size-6 place-items-center rounded-full bg-black/60 text-white"
                  aria-label="Edit foto"
                >
                  <Crop className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setUrls((prev) => prev.filter((item) => item !== url))
                  }
                  className="grid size-6 place-items-center rounded-full bg-black/60 text-white"
                  aria-label="Hapus foto"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-muted/30",
          pending && "pointer-events-none opacity-80",
        )}
      >
        <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          {pending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <UploadCloud className="size-5" />
          )}
        </span>
        <p className="text-sm font-medium">
          {pending
            ? `Mengunggah ${progress.done}/${progress.total}...`
            : "Tarik banyak foto ke sini atau pilih berkas"}
        </p>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, atau WEBP · maksimal {maxMb} MB/foto · {remaining} slot lagi
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={pending || remaining <= 0}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" /> Pilih foto
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <ImageEditor
        open={editorOpen}
        src={editorSrc}
        fileName={editorFile?.name ?? "foto.jpg"}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open && editorSrc) {
            URL.revokeObjectURL(editorSrc);
            setEditorSrc(null);
            setEditorFile(null);
            setEditingIndex(null);
          }
        }}
        onComplete={handleCropCompleteMulti}
      />
    </div>
  );
}
