"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  Building2,
  CreditCard,
  Loader2,
  Mail,
  MapPinned,
  Palette,
  Share2,
  Settings2,
  Shield,
  Sparkles,
} from "lucide-react";

import { saveSettingsAction } from "@/app/dashboard/admin/actions";
import { ActionForm } from "@/components/forms/action-form";
import { Button } from "@/components/ui/button";
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
  GROUP_LABELS,
  SETTINGS_DEFS,
  SETTING_GROUPS,
  type SettingDef,
  type SettingGroup,
} from "@/lib/settings-defs";
import { cn } from "@/lib/utils";

const GROUP_META: Record<
  SettingGroup,
  { icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  identitas: {
    icon: Building2,
    description: "Nama, logo, dan teks brand yang tampil di seluruh situs.",
  },
  tampilan: {
    icon: Palette,
    description: "Warna, pengumuman, watermark, dan batas unggahan.",
  },
  kontak: {
    icon: Mail,
    description: "Cara pengunjung menghubungi Anda.",
  },
  sosial: {
    icon: Share2,
    description: "Tautan akun media sosial resmi.",
  },
  pendaftaran: {
    icon: Settings2,
    description: "Kontrol pendaftaran, mode pemeliharaan, dan zona waktu.",
  },
  pembayaran: {
    icon: CreditCard,
    description: "Rekening tujuan untuk pembelian paket.",
  },
  ai: {
    icon: Sparkles,
    description: "Integrasi penyedia AI untuk membuat template otomatis.",
  },
  peta: {
    icon: MapPinned,
    description: "Peta lokasi acara memakai Google Maps.",
  },
};

function Field({ def, value }: { def: SettingDef; value: string }) {
  const id = `setting-${def.key}`;

  if (def.type === "boolean") {
    return (
      <label
        htmlFor={id}
        className="flex cursor-pointer items-start gap-3 rounded-xl border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
      >
        <input type="hidden" name={def.key} value="0" />
        <input
          id={id}
          type="checkbox"
          name={def.key}
          value="1"
          defaultChecked={value === "1"}
          className="mt-0.5 size-4 accent-[var(--primary)]"
        />
        <span>
          <span className="block text-sm font-medium">{def.label}</span>
          {def.help ? (
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {def.help}
            </span>
          ) : null}
        </span>
      </label>
    );
  }

  if (def.type === "select") {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{def.label}</Label>
        <Select name={def.key} defaultValue={value}>
          <SelectTrigger id={id}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(def.options ?? []).map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {def.help ? (
          <p className="text-xs text-muted-foreground">{def.help}</p>
        ) : null}
      </div>
    );
  }

  if (def.type === "color") {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{def.label}</Label>
        <div className="flex items-center gap-3 rounded-lg border p-1.5">
          <input
            id={id}
            name={def.key}
            type="color"
            defaultValue={value || "#000000"}
            className="size-9 shrink-0 cursor-pointer rounded-md border-0 bg-transparent p-0"
          />
          <span className="font-mono text-sm text-muted-foreground">
            {value || "#000000"}
          </span>
        </div>
        {def.help ? (
          <p className="text-xs text-muted-foreground">{def.help}</p>
        ) : null}
      </div>
    );
  }

  if (def.type === "textarea") {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{def.label}</Label>
        <Textarea id={id} name={def.key} rows={3} defaultValue={value} />
        {def.help ? (
          <p className="text-xs text-muted-foreground">{def.help}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {def.label}
        {def.secret ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (rahasia)
          </span>
        ) : null}
      </Label>
      <Input
        id={id}
        name={def.key}
        type={def.secret ? "password" : def.type === "number" ? "number" : "text"}
        defaultValue={def.secret ? "" : value}
        placeholder={def.secret && value ? "•••••• (biarkan kosong untuk tetap)" : undefined}
      />
      {def.help ? (
        <p className="text-xs text-muted-foreground">{def.help}</p>
      ) : null}
    </div>
  );
}

function SubmitBar({ changed }: { changed: number }) {
  const { pending } = useFormStatus();
  return (
    <div className="sticky bottom-4 z-10 flex flex-col items-start justify-between gap-3 rounded-2xl border bg-background/90 px-4 py-3 shadow-lg backdrop-blur sm:flex-row sm:items-center">
      <p className="text-sm text-muted-foreground">
        {changed > 0
          ? `${changed} grup diubah — berlaku di seluruh situs setelah disimpan.`
          : "Perubahan berlaku di seluruh situs setelah disimpan."}
      </p>
      <Button type="submit" disabled={pending} className="sheen w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        Simpan pengaturan
      </Button>
    </div>
  );
}

export function SettingsEditor({ values }: { values: Record<string, string> }) {
  const [group, setGroup] = useState<SettingGroup>(SETTING_GROUPS[0]);
  const [dirty, setDirty] = useState<Set<SettingGroup>>(new Set());

  const counts = useMemo(() => {
    const map = {} as Record<SettingGroup, number>;
    for (const def of SETTINGS_DEFS) {
      map[def.group] = (map[def.group] ?? 0) + 1;
    }
    return map;
  }, []);

  const markDirty = (value: SettingGroup) =>
    setDirty((prev) => {
      if (prev.has(value)) return prev;
      const next = new Set(prev);
      next.add(value);
      return next;
    });

  const activeMeta = GROUP_META[group];
  const ActiveIcon = activeMeta.icon;
  const activeDefs = SETTINGS_DEFS.filter((def) => def.group === group);

  return (
    <ActionForm
      action={saveSettingsAction}
      showSubmit={false}
      className="space-y-6"
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SETTING_GROUPS.map((item) => {
          const Icon = GROUP_META[item].icon;
          const isActive = item === group;
          return (
            <button
              key={item}
              type="button"
              onClick={() => setGroup(item)}
              className={cn(
                "card-lift group relative flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200",
                isActive
                  ? "border-primary/40 bg-gradient-to-br from-primary/10 to-transparent shadow-sm ring-1 ring-primary/20"
                  : "hover:border-foreground/20 hover:bg-muted/50",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg transition-all duration-200 group-hover:scale-105",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {GROUP_LABELS[item]}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {counts[item]} pengaturan
                </span>
              </span>
              {dirty.has(item) ? (
                <span className="absolute top-2 right-2 size-2 animate-pulse rounded-full bg-accent" />
              ) : null}
              {isActive ? (
                <span className="absolute -bottom-px left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary/60 via-accent to-transparent" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <header className="flex items-start gap-3 border-b bg-muted/30 px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <ActiveIcon className="size-4" />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-lg">{GROUP_LABELS[group]}</h2>
            <p className="text-sm text-muted-foreground">
              {activeMeta.description}
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-muted-foreground sm:inline-flex">
            <Shield className="size-3.5" /> {activeDefs.length} field
          </span>
        </header>

        {SETTING_GROUPS.map((item) => {
          const defs = SETTINGS_DEFS.filter((def) => def.group === item);
          return (
            <div
              key={item}
              hidden={item !== group}
              onInput={() => markDirty(item)}
              onChange={() => markDirty(item)}
              className="grid gap-5 p-5 sm:grid-cols-2"
            >
              {defs.map((def) => (
                <div
                  key={def.key}
                  className={cn(
                    (def.type === "textarea" ||
                      def.type === "boolean" ||
                      def.type === "select") &&
                      "sm:col-span-2",
                  )}
                >
                  <Field def={def} value={values[def.key] ?? def.default} />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <SubmitBar changed={dirty.size} />
    </ActionForm>
  );
}
