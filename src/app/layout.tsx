import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ActionOverlay } from "@/components/feedback/action-overlay";
import { ConfirmProvider } from "@/components/feedback/confirm";
import { SITE_SETTINGS_KEYS } from "@/lib/constants";
import { getSettings } from "@/lib/settings";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings[SITE_SETTINGS_KEYS.siteName] ?? "UndanganKita";
  const description = settings[SITE_SETTINGS_KEYS.siteDescription] ?? "";
  const favicon = settings[SITE_SETTINGS_KEYS.faviconUrl];

  return {
    title: {
      default: siteName,
      template: `%s · ${siteName}`,
    },
    description,
    icons: favicon ? { icon: favicon } : undefined,
  };
}

export const instant = false;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConfirmProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ConfirmProvider>
        <ActionOverlay />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
