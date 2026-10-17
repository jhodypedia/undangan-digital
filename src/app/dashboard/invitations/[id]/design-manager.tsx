"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eraser, Lock, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import {
  applyInvitationLookAction,
  clearInvitationLookAction,
  generateBackgroundAction,
  previewInvitationLookAction,
  updateInvitationDesign,
} from "@/app/dashboard/invitations/actions";
import { ActionForm } from "@/components/forms/action-form";
import { ImageUploader } from "@/components/forms/image-uploader";
import { TemplatePreview } from "@/components/dashboard/template-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Invitation } from "@/db/schema";
import type { GeneratedTemplate } from "@/lib/ai";

const BG_PRESETS = [
  "Taman bunga lembut kabur, nuansa pastel, cahaya pagi.",
  "Tekstur marmer putih dan emas, elegan.",
  "Langit senja hangat dengan bokeh emas.",
  "Dedaunan tropis hijau gelap, mewah dan teduh.",
];

const LOOK_PRESETS = [
  "Undangan pernikahan adat Jawa, hijau tua dan emas, motif batik parang.",
  "Pernikahan islami minimalis, putih dan emas, geometri arabesque.",
  "Pernikahan modern biru laut, nuansa pantai, tipografi bersih.",
  "Perayaan ulang tahun ceria, warna cerah, motif balon dan bintang.",
];

export function DesignManager({
  invitation,
  maxMb = 5,
  isPremium,
  planName,
}: {
  invitation: Invitation;
  maxMb?: number;
  isPremium: boolean;
  planName: string;
}) {
  const router = useRouter();
  const [backgroundImage, setBackgroundImage] = useState(
    invitation.backgroundImage ?? "",
  );
  const [overlay, setOverlay] = useState(invitation.backgroundOverlay ?? 40);
  const [blur, setBlur] = useState(invitation.backgroundBlur ?? 0);

  const [bgPrompt, setBgPrompt] = useState("");
  const [generatingBg, startGenBg] = useTransition();

  const [lookPrompt, setLookPrompt] = useState("");
  const [generated, setGenerated] = useState<GeneratedTemplate | null>(null);
  const [previewingLook, startPreviewLook] = useTransition();
  const [applyingLook, startApplyLook] = useTransition();
  const [hasCustomLook, setHasCustomLook] = useState(
    Boolean(invitation.customConfig),
  );

  const coupleTitle =
    invitation.brideName && invitation.groomName
      ? `${invitation.brideName} & ${invitation.groomName}`
      : invitation.brideName || invitation.groomName || invitation.title;

  const generateBg = () => {
    if (!bgPrompt.trim()) {
      toast.error("Tulis deskripsi latar terlebih dahulu.");
      return;
    }
    startGenBg(async () => {
      const result = await generateBackgroundAction(invitation.id, bgPrompt);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      if (result.url) {
        setBackgroundImage(result.url);
        toast.success("Latar AI dibuat dan diterapkan.");
        router.refresh();
      }
    });
  };

  const runPreviewLook = () => {
    if (!lookPrompt.trim()) {
      toast.error("Tulis deskripsi tampilan terlebih dahulu.");
      return;
    }
    startPreviewLook(async () => {
      const result = await previewInvitationLookAction(
        invitation.id,
        lookPrompt,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setGenerated(result.generated ?? null);
    });
  };

  const applyLook = () => {
    if (!generated) return;
    startApplyLook(async () => {
      const result = await applyInvitationLookAction(invitation.id, generated);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Tampilan diterapkan.");
      setGenerated(null);
      setLookPrompt("");
      setHasCustomLook(true);
      router.refresh();
    });
  };

  const clearLook = () => {
    startApplyLook(async () => {
      const result = await clearInvitationLookAction(invitation.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Tampilan AI dihapus.");
      setHasCustomLook(false);
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Latar undangan (setelah dibuka)
            </CardTitle>
            <CardDescription>
              Pakai foto agar tampilan tidak kaku, lalu atur gelap dan blur.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActionForm
              action={updateInvitationDesign}
              submitLabel="Simpan latar"
              className="space-y-4"
            >
              <input type="hidden" name="id" value={invitation.id} />
              <div className="space-y-2">
                <Label>Foto latar</Label>
                <ImageUploader
                  name="backgroundImage"
                  value={backgroundImage}
                  onChange={setBackgroundImage}
                  maxMb={maxMb}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="backgroundOverlay">
                    Gelap latar · {overlay}%
                  </Label>
                  <input
                    id="backgroundOverlay"
                    name="backgroundOverlay"
                    type="range"
                    min={0}
                    max={90}
                    step={5}
                    value={overlay}
                    onChange={(event) => setOverlay(Number(event.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backgroundBlur">Blur · {blur}px</Label>
                  <input
                    id="backgroundBlur"
                    name="backgroundBlur"
                    type="range"
                    min={0}
                    max={24}
                    step={2}
                    value={blur}
                    onChange={(event) => setBlur(Number(event.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
              </div>
            </ActionForm>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Sparkles className="size-4 text-accent" /> Buat latar dengan AI
              {!isPremium ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  <Lock className="size-3" /> Premium
                </span>
              ) : null}
            </CardTitle>
            <CardDescription>
              {isPremium
                ? "Deskripsikan suasana yang diinginkan, AI membuat gambar latar."
                : `Paket ${planName} belum mendukung pembuatan gambar AI.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bg-prompt">Deskripsi latar</Label>
              <Textarea
                id="bg-prompt"
                rows={3}
                value={bgPrompt}
                onChange={(event) => setBgPrompt(event.target.value)}
                placeholder={BG_PRESETS[0]}
                disabled={!isPremium}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {BG_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant="outline"
                  size="xs"
                  disabled={!isPremium}
                  onClick={() => setBgPrompt(preset)}
                >
                  <Wand2 className="size-3" /> Contoh
                </Button>
              ))}
            </div>
            <Button
              type="button"
              onClick={generateBg}
              disabled={!isPremium || generatingBg}
            >
              {generatingBg ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Buat latar AI
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <Wand2 className="size-4 text-accent" /> Tampilan undangan via AI
              {!isPremium ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  <Lock className="size-3" /> Premium
                </span>
              ) : null}
            </CardTitle>
            <CardDescription>
              {isPremium
                ? "Buat tampilan halaman undangan khusus untuk undangan ini, lengkap dengan warna dan efek."
                : `Paket ${planName} belum mendukung generator tampilan AI.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[1fr_240px]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="look-prompt">Deskripsi tampilan</Label>
                <Textarea
                  id="look-prompt"
                  rows={4}
                  value={lookPrompt}
                  onChange={(event) => setLookPrompt(event.target.value)}
                  placeholder={LOOK_PRESETS[0]}
                  disabled={!isPremium}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {LOOK_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={!isPremium}
                    onClick={() => setLookPrompt(preset)}
                  >
                    <Wand2 className="size-3" /> Contoh
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={runPreviewLook}
                  disabled={!isPremium || previewingLook}
                >
                  {previewingLook ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Buat pratinjau
                </Button>
                {generated ? (
                  <Button
                    type="button"
                    onClick={applyLook}
                    disabled={applyingLook}
                  >
                    {applyingLook ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Terapkan
                  </Button>
                ) : null}
                {hasCustomLook ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearLook}
                    disabled={applyingLook}
                  >
                    <Eraser className="size-4" /> Hapus tampilan AI
                  </Button>
                ) : null}
              </div>
              {hasCustomLook ? (
                <p className="text-xs text-muted-foreground">
                  Tampilan AI aktif untuk undangan ini. Hapus untuk kembali ke
                  template.
                </p>
              ) : null}
            </div>
            <div className="rounded-2xl border bg-muted/30 p-4">
              {generated ? (
                <TemplatePreview config={generated.config} />
              ) : (
                <p className="grid h-full min-h-56 place-items-center text-center text-xs text-muted-foreground">
                  Pratinjau tampilan AI muncul di sini.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 lg:sticky lg:top-6 lg:self-start">
        <p className="text-sm font-medium">Pratinjau langsung</p>
        <div className="relative h-80 overflow-hidden rounded-2xl border">
          {backgroundImage ? (
            <div
              className="absolute -inset-4 bg-cover bg-center"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                filter: blur ? `blur(${blur}px)` : undefined,
              }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: invitation.themeColor }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: `rgba(0,0,0,${overlay / 100})` }}
          />
          <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/70">
              Undangan
            </span>
            <span className="font-display text-2xl">{coupleTitle}</span>
            <span className="h-px w-10" style={{ background: invitation.accentColor }} />
            <span
              className="rounded-full px-4 py-1.5 text-[11px] font-medium"
              style={{
                background: invitation.accentColor,
                color: invitation.themeColor,
              }}
            >
              Buka Undangan
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Gelap {overlay}% · Blur {blur}px. Geser slider untuk melihat
          perubahannya langsung. Kurangi gelap bila foto terlalu terang, tambah
          blur agar tulisan lebih terbaca.
        </p>
      </div>
    </div>
  );
}
