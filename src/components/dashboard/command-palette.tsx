"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { NAV_GROUPS } from "@/lib/nav";
import type { UserRole } from "@/lib/constants";

const QUICK_ACTIONS = [
  { href: "/dashboard/invitations", label: "Buat undangan baru", keywords: "tambah baru buat" },
  { href: "/dashboard/guests", label: "Tambah tamu", keywords: "tamu baru import" },
  { href: "/dashboard/billing", label: "Tingkatkan ke Premium", keywords: "upgrade premium langganan" },
];

export function CommandPalette({
  open,
  onOpenChange,
  role,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: UserRole;
}) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Pencarian cepat"
      description="Cari halaman dan aksi."
      className="sm:max-w-xl"
    >
      <CommandInput placeholder="Cari halaman, aksi, dan tautan..." />
      <CommandList>
        <CommandEmpty>Tidak ada hasil.</CommandEmpty>
        <CommandGroup heading="Aksi cepat">
          {QUICK_ACTIONS.map((action) => (
            <CommandItem
              key={action.href + action.label}
              value={`${action.label} ${action.keywords}`}
              onSelect={() => go(action.href)}
            >
              <Plus className="size-4" />
              {action.label}
              <ArrowRight className="ml-auto size-3.5 opacity-50" />
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        {NAV_GROUPS.filter((group) => !group.admin || role === "admin").map(
          (group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={`${item.label} ${item.keywords ?? ""} ${item.href}`}
                    onSelect={() => go(item.href)}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ),
        )}
      </CommandList>
    </CommandDialog>
  );
}
