"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  ArrowRight,
  Loader2,
  Mail,
  ShieldAlert,
  User,
  UserPlus,
} from "lucide-react";

import { registerAction, type AuthState } from "@/app/(auth)/actions";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="anim-rise space-y-6">
      <div className="space-y-4">
        <span
          className="grid size-12 place-items-center rounded-2xl text-primary"
          style={{
            background:
              "linear-gradient(140deg, color-mix(in srgb, var(--accent) 30%, transparent), color-mix(in srgb, var(--primary) 12%, transparent))",
          }}
        >
          <UserPlus className="size-6" />
        </span>
        <div className="space-y-1">
          <h1 className="font-display text-3xl tracking-tight">Buat akun</h1>
          <p className="text-sm text-muted-foreground">
            Gratis untuk memulai. Tanpa kartu kredit.
          </p>
        </div>
      </div>

      {state.error ? (
        <p className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="name">Nama lengkap</Label>
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            placeholder="Nama Anda"
            required
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            required
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Kata sandi</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Min. 8 karakter"
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Ulangi</Label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Ulangi sandi"
            autoComplete="new-password"
          />
        </div>
      </div>

      <Button type="submit" className="sheen group w-full" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <UserPlus className="size-4" />
        )}
        Daftar
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}
