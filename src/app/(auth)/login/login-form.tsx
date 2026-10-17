"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2, LogIn, Mail, ShieldAlert } from "lucide-react";

import { loginAction, type AuthState } from "@/app/(auth)/actions";
import { PasswordInput } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

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
          <LogIn className="size-6" />
        </span>
        <div className="space-y-1">
          <h1 className="font-display text-3xl tracking-tight">Selamat datang</h1>
          <p className="text-sm text-muted-foreground">
            Masuk untuk melanjutkan mengelola undangan Anda.
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

      <div className="space-y-2">
        <Label htmlFor="password">Kata sandi</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="sheen group w-full" disabled={pending}>
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LogIn className="size-4" />
        )}
        Masuk
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Daftar gratis
        </Link>
      </p>
    </form>
  );
}
