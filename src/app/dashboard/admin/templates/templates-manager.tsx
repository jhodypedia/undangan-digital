"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import {
  deleteTemplate,
  previewTemplateAction,
  saveGeneratedTemplateAction,
  saveTemplate,
  toggleTemplate,
} from "@/app/dashboard/admin/actions";
import { ActionForm } from "@/components/forms/action-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { TemplatePreview } from "@/components/dashboard/template-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import type { Template } from "@/db/schema";
import type { GeneratedTemplate } from "@/lib/ai";
import {
  TEMPLATE_LAYOUTS,
  normalizeTemplateConfig,
  type TemplateConfig,
} from "@/lib/template-config";

const PRESETS = [
  "Undangan pernikahan adat Jawa, hijau tua dan emas, motif batik parang.",
  "Pernikahan islami minimalis, putih dan emas, geometri arabesque.",
  "Ulang tahun anak ceria, warna cerah, motif balon dan bintang.",
  "Pernikahan modern biru laut, nuansa pantai, tipografi bersih.",
];

export function TemplateGenerator() {
  const [prompt, setPrompt] = useState("");
  const [generated, setGenerated] = useState<GeneratedTemplate | null>(null);
  const [previewing, startPreview] = useTransition();
  const [saving, startSave] = useTransition();

  const runPreview = () => {
    if (!prompt.trim()) {
      toast.error("Tulis deskripsi template terlebih dahulu.");
      return;
    }
    startPreview(async () => {
      const result = await previewTemplateAction(prompt);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setGenerated(result.generated ?? null);
    });
  };

  const save = () => {
    if (!generated) return;
    startSave(async () => {
      const result = await saveGeneratedTemplateAction(generated);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success ?? "Template disimpan.");
        setGenerated(null);
        setPrompt("");
      }
    });
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-lg">
          <Sparkles className="size-4 text-accent" /> Generator template AI
        </CardTitle>
        <CardDescription>
          Tulis deskripsi, lihat pratinjau langsung, lalu simpan. Efek dan
          animasi otomatis diterapkan ke undangan.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Deskripsi template</Label>
            <Textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder={PRESETS[0]}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setPrompt(preset)}
              >
                <Wand2 className="size-3" /> Contoh
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={runPreview} disabled={previewing}>
              {previewing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Buat pratinjau
            </Button>
            {generated ? (
              <Button
                type="button"
                variant="default"
                onClick={save}
                disabled={saving}
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                Simpan template
              </Button>
            ) : null}
          </div>
          {generated ? (
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="font-medium">{generated.name}</p>
              <p className="mt-1 text-muted-foreground">
                {generated.description}
              </p>
              <Badge className="mt-2 gap-1" variant="outline">
                {generated.source === "ai" ? "AI" : "Generator bawaan"}
              </Badge>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border bg-muted/30 p-4">
          {generated ? (
            <TemplatePreview config={generated.config} />
          ) : (
            <p className="grid h-full min-h-64 place-items-center text-center text-xs text-muted-foreground">
              Pratinjau akan muncul di sini — lengkap dengan warna, tipografi,
              dan efek animasi.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateFields({ template }: { template: Template }) {
  const initial = normalizeTemplateConfig(template.config);
  const [layout, setLayout] = useState(initial.layout);
  const [config, setConfig] = useState<TemplateConfig["colors"]>(initial.colors);

  const setColor = (key: keyof TemplateConfig["colors"], value: string) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  const previewConfig: TemplateConfig = { ...initial, layout, colors: config };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_260px]">
      <div className="space-y-4">
        <input type="hidden" name="id" value={template.id} />
        <div className="space-y-2">
          <Label htmlFor={`tname-${template.id}`}>Nama</Label>
          <Input
            id={`tname-${template.id}`}
            name="name"
            defaultValue={template.name}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`tdesc-${template.id}`}>Deskripsi</Label>
          <Input
            id={`tdesc-${template.id}`}
            name="description"
            defaultValue={template.description ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`tlay-${template.id}`}>Layout</Label>
          <Select
            name="layout"
            value={layout}
            onValueChange={(value) => setLayout(value as typeof layout)}
          >
            <SelectTrigger id={`tlay-${template.id}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_LAYOUTS.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField
            id={`tp-${template.id}`}
            name="primaryColor"
            label="Warna utama"
            value={config.primary}
            onChange={(value) => setColor("primary", value)}
          />
          <ColorField
            id={`ta-${template.id}`}
            name="accentColor"
            label="Aksen"
            value={config.accent}
            onChange={(value) => setColor("accent", value)}
          />
          <ColorField
            id={`tbg-${template.id}`}
            name="backgroundColor"
            label="Latar"
            value={config.background}
            onChange={(value) => setColor("background", value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            id={`tsurf-${template.id}`}
            name="surfaceColor"
            label="Permukaan"
            value={config.surface}
            onChange={(value) => setColor("surface", value)}
          />
          <ColorField
            id={`ttext-${template.id}`}
            name="textColor"
            label="Teks"
            value={config.text}
            onChange={(value) => setColor("text", value)}
          />
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isPremium"
              defaultChecked={template.isPremium}
              className="size-4"
            />
            Premium
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={template.isActive}
              className="size-4"
            />
            Aktif
          </label>
        </div>
      </div>
      <div className="rounded-2xl border bg-muted/30 p-4">
        <TemplatePreview config={previewConfig} artworkCode={template.code} />
      </div>
    </div>
  );
}

function ColorField({
  id,
  name,
  label,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function TemplatesManager({ templates }: { templates: Template[] }) {
  const [editId, setEditId] = useState<number | null>(null);
  const editing = templates.find((item) => item.id === editId) ?? null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => {
          const config = normalizeTemplateConfig(template.config);
          return (
            <Card key={template.id} className="shadow-none">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-display text-lg">
                    {template.name}
                  </CardTitle>
                  <div className="flex gap-1">
                    {template.source === "ai" ? (
                      <Badge className="gap-1">
                        <Sparkles className="size-3" /> AI
                      </Badge>
                    ) : null}
                    {template.isPremium ? (
                      <Badge variant="outline">Premium</Badge>
                    ) : null}
                  </div>
                </div>
                <CardDescription>
                  {config.layout} · {config.motif}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  {Object.values(config.colors).map((color) => (
                    <span
                      key={color}
                      className="size-7 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {template.prompt ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    Prompt: {template.prompt}
                  </p>
                ) : null}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditId(template.id)}
                  >
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <form action={toggleTemplate}>
                    <input type="hidden" name="id" value={template.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={String(template.isActive)}
                    />
                    <Button type="submit" size="sm" variant="ghost">
                      {template.isActive ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </form>
                  <DeleteButton
                    action={deleteTemplate}
                    hidden={{ id: template.id }}
                    label=""
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog
        open={editId !== null}
        onOpenChange={(open) => !open && setEditId(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Edit template</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ActionForm
              action={saveTemplate}
              submitLabel="Simpan"
              onSuccess={() => setEditId(null)}
            >
              <TemplateFields template={editing} />
            </ActionForm>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
