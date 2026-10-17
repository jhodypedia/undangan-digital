"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  CreditCard,
  Crown,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
} from "lucide-react";

import { logoutAction } from "@/app/(auth)/actions";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { PageEnter } from "@/components/transitions/page-enter";
import { RouteOverlay } from "@/components/transitions/route-overlay";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ROLE_LABELS, type UserRole } from "@/lib/constants";
import { initials } from "@/lib/format";
import { NAV_GROUPS, currentTitle, isActiveItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

export type ShellUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  premiumUntil: Date | null;
};

function Brand({
  brand,
  logoUrl,
}: {
  brand: string;
  logoUrl?: string | null;
}) {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={brand}
          width={36}
          height={36}
          unoptimized
          className="size-9 rounded-xl object-cover"
        />
      ) : (
        <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-sm text-primary-foreground shadow-[0_8px_20px_-8px_var(--primary)]">
          {brand.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="truncate font-display text-lg tracking-tight">
        {brand}
      </span>
    </Link>
  );
}

function NavGroupList({
  pathname,
  role,
  onNavigate,
}: {
  pathname: string;
  role: UserRole;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-5">
      {NAV_GROUPS.filter((group) => !group.admin || role === "admin").map(
        (group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-3 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground/60 uppercase">
              {group.label}
            </p>
            <nav className="grid gap-0.5">
              {group.items.map((item) => {
                const active = isActiveItem(pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    data-active={active}
                    className={cn(
                      "nav-item flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
                      active
                        ? "bg-primary/8 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ),
      )}
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="sheen relative overflow-hidden rounded-xl bg-primary p-4 text-primary-foreground">
      <div
        aria-hidden
        className="absolute -top-8 -right-6 size-24 rounded-full bg-accent/25 blur-2xl"
      />
      <div className="relative flex items-center gap-2">
        <Crown className="anim-float size-4 text-accent" />
        <p className="text-sm font-medium">Paket Premium</p>
      </div>
      <p className="relative mt-1 text-xs text-primary-foreground/70">
        Tamu tanpa batas, amplop digital, tanpa watermark.
      </p>
      <Button asChild size="sm" variant="secondary" className="relative mt-3 w-full">
        <Link href="/dashboard/billing">Upgrade sekarang</Link>
      </Button>
    </div>
  );
}

function UserRow({ user }: { user: ShellUser }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border bg-card p-2.5">
      <Avatar className="size-9">
        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
          {initials(user.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {ROLE_LABELS[user.role]}
        </p>
      </div>
      <form action={logoutAction}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          aria-label="Keluar"
        >
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function DashboardShell({
  user,
  brand = "UndanganKita",
  logoUrl,
  announcement,
  children,
}: {
  user: ShellUser;
  brand?: string;
  logoUrl?: string | null;
  announcement?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const role = user.role;
  const title = currentTitle(pathname);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Brand brand={brand} logoUrl={logoUrl} />
      </div>
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            setPaletteOpen(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          <Search className="size-4" />
          <span>Cari...</span>
          <kbd className="ml-auto rounded border bg-background px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <NavGroupList
          pathname={pathname}
          role={role}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>
      <div className="space-y-3 border-t p-3">
        {role === "free" ? <UpgradeCard /> : null}
        <UserRow user={user} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-svh w-full bg-muted/40">
      <RouteOverlay brand={brand} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} role={role} />
      <form id="logout-form" action={logoutAction} className="hidden" />

      <aside className="hidden w-64 shrink-0 border-r bg-card lg:block">
        <div className="sticky top-0 h-svh">{sidebar}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>

          <div className="min-w-0">
            <p className="hidden text-[11px] tracking-wide text-muted-foreground uppercase sm:block">
              Dasbor / {title}
            </p>
            <h1 className="truncate font-display text-lg leading-tight">{title}</h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden size-9 place-items-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted md:grid"
              aria-label="Pencarian cepat"
            >
              <Search className="size-4" />
            </button>
            <Button
              variant="outline"
              size="icon"
              className="size-9 text-muted-foreground"
              aria-label="Notifikasi"
            >
              <Bell className="size-4" />
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard/invitations">
                <Plus className="size-4" /> Undangan baru
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg border py-1 pr-2 pl-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="size-4" /> Pengaturan akun
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing">
                    <CreditCard className="size-4" /> Langganan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild variant="destructive">
                  <button type="submit" form="logout-form" className="w-full">
                    <LogOut className="size-4" /> Keluar
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {announcement ? (
          <div className="anim-fade border-b bg-accent/10 px-4 py-2 text-center text-sm text-accent-foreground lg:px-8">
            {announcement}
          </div>
        ) : null}

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <PageEnter>{children}</PageEnter>
          </div>
        </main>
      </div>
    </div>
  );
}
