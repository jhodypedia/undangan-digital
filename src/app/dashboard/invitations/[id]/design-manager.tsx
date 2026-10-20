"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eraser, Lock, Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import {
  applyInvitationLookAction,
  applyTemplateAction,
  clearInvitationLookAction,
  generateBackgroundAction,
  previewInvitationLookAction,
  updateInvitationDesign,
} from "@/app/dashboard/invitations/actions";
import { ActionForm } from "@/components/forms/action-form";
import { ImageUploader } from "@/components/forms/image-uploader";
import { TemplatePreview } from "@/components/dashboard/template-preview";
import { LiveInvitationPreview } from "@/components/invitation/live-preview";
import { formatDateID } from "@/lib/time";
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
import type { Invitation, Template } from "@/db/schema";
import type { GeneratedTemplate } from "@/lib/ai";
import { normalizeTemplateConfig } from "@/lib/template-config";

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
  templates,
  maxMb = 5,
  isPremium,
  planName,
}: {
  invitation: Invitation;
  templates: Template[];
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    invitation.templateId ?? templates[0]?.id ?? null,
  );
  const [applyingTemplate, startApplyTemplate] = useTransition();
  const selectedTemplate =
    templates.find((item) => item.id === selectedTemplateId) ?? null;
  const selectedConfig = normalizeTemplateConfig(selectedTemplate?.config);

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
      if (result.generated?.config) {
        setGenerated(result.generated);
        toast.success("Pratinjau tampilan siap.");
      } else {
        toast.error("AI tidak mengembalikan tampilan yang valid. Coba lagi.");
      }
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

  const applyTemplate = () => {
    if (!selectedTemplate) return;
    startApplyTemplate(async () => {
      const result = await applyTemplateAction(
        invitation.id,
        selectedTemplate.id,
      );
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.success ?? "Template diterapkan.");
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
              Template undangan
            </CardTitle>
            <CardDescription>
              Pilih tema, lalu lihat pratinjau asli sebelum menerapkannya.
              Template premium terkunci untuk paket {planName}.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-[1fr_240px]">
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {templates.map((template) => {
                const config = normalizeTemplateConfig(template.config);
                const locked = template.isPremium && !isPremium;
                const active = template.id === selectedTemplateId;
                return (
                  <button
                    key={template.id}
                    type="button"
                    aria-pressed={active}
                    disabled={locked}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                      active
                        ? "border-[var(--primary)] bg-muted/60"
                        : "hover:bg-muted/40"
                    } ${locked ? "cursor-not-allowed opacity-55" : ""}`}
                  >
                    <span
                      aria-hidden
                      className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border"
                      style={{
                        background: config.colors.background,
                        borderColor: config.colors.primary,
                      }}
                    >
                      <span
                        className="absolute inset-x-0 top-0 h-1/2"
                        style={{ background: config.colors.primary }}
                      />
                      <span
                        className="relative size-3 rounded-full border"
                        style={{
                          background: config.colors.accent,
                          borderColor: config.colors.surface,
                        }}
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {template.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {config.layout} · {config.coverStyle} ·{" "}
                        {config.frameStyle}
                      </span>
                    </span>
                    {template.isPremium ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                        <Lock className="size-3" /> Premium
                      </span>
                    ) : null}
                  </button>
                );
              })}
              {templates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Belum ada template aktif.
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border bg-muted/30 p-3">
                {selectedConfig ? (
                  <TemplatePreview config={selectedConfig} />
                ) : (
                  <p className="grid min-h-56 place-items-center text-center text-xs text-muted-foreground">
                    Pilih template untuk melihat pratinjau.
                  </p>
                )}
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={applyTemplate}
                disabled={
                  !selectedTemplate ||
                  applyingTemplate ||
                  (selectedTemplate.id === invitation.templateId &&
                    !hasCustomLook)
                }
              >
                {applyingTemplate ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Terapkan template
              </Button>
            </div>
          </CardContent>
        </Card>

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
              {generated?.config ? (
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
          <LiveInvitationPreview
            coupleTitle={coupleTitle}
            dateLabel={
              invitation.eventDate
                ? formatDateID(invitation.eventDate)
                : "Segera"
            }
            subtitle="Undangan Pernikahan"
            coverPhoto={invitation.coverPhoto ?? undefined}
            backgroundImage={backgroundImage || undefined}
            overlay={overlay}
            blur={blur}
            colors={{
              primary: invitation.themeColor || "#0b3d2e",
              accent: invitation.accentColor || "#c9a24b",
              background: invitation.backgroundImage ? "#0f172a" : "#f7f3ea",
              surface: "#ffffff",
              text: "#17241d",
            }}
            fontDisplay={
              invitation.customConfig?.fontDisplay ?? "Playfair Display"
            }
            showSections={false}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Gelap {overlay}% · Blur {blur}px. Geser slider — pratinjau langsung
          berubah. Kurangi gelap bila foto terlalu terang, tambah blur agar
          tulisan lebih terbaca.
        </p>
      </div>
    </div>
  );
}
