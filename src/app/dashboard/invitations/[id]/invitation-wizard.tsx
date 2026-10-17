"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import {
  AlbumManager,
  EventsManager,
  GalleryManager,
  GiftsManager,
  StoriesManager,
} from "@/app/dashboard/invitations/[id]/content-managers";
import { DesignManager } from "@/app/dashboard/invitations/[id]/design-manager";
import { InvitationInfoForm } from "@/app/dashboard/invitations/[id]/invitation-info-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  Invitation,
  InvitationEvent,
  Story,
  Gallery,
  Album,
  Gift,
} from "@/db/schema";

type Detail = {
  invitation: Invitation;
  events: InvitationEvent[];
  stories: Story[];
  galleries: Gallery[];
  gifts: Gift[];
  albums: Album[];
};

export function InvitationWizard({
  detail,
  maxMb,
  isPremium,
  planName,
  maxGallery,
}: {
  detail: Detail;
  maxMb: number;
  isPremium: boolean;
  planName: string;
  maxGallery: number;
}) {
  const { invitation, events, stories, galleries, gifts, albums } = detail;
  const [step, setStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const steps = [
    { title: "Info & mempelai", short: "Info" },
    { title: "Acara", short: "Acara" },
    { title: "Cerita", short: "Cerita" },
    { title: "Desain", short: "Desain" },
    { title: "Galeri", short: "Galeri" },
    { title: "Album", short: "Album" },
    { title: "Hadiah", short: "Hadiah" },
  ];

  const advance = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const handleNext = () => {
    // Hanya langkah "Info & mempelai" yang punya form simpan utama.
    // Langkah lain (manajer) menyimpan tiap item secara inline, jadi cukup maju.
    if (step === 0) {
      const form = containerRef.current?.querySelector("form");
      if (form) {
        form.requestSubmit();
        // advance terjadi via onSuccess saat simpan berhasil
        return;
      }
    }
    advance();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setStep(index)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              index === step
                ? "border-primary bg-primary text-primary-foreground"
                : index < step
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
            )}
          >
            {index + 1}. {item.short}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="min-h-[40vh]">
        {step === 0 ? (
          <InvitationInfoForm
            invitation={invitation}
            maxMb={maxMb}
            showSubmit={false}
            onSuccess={advance}
          />
        ) : null}
        {step === 1 ? (
          <EventsManager invitationId={invitation.id} items={events} />
        ) : null}
        {step === 2 ? (
          <StoriesManager
            invitationId={invitation.id}
            items={stories}
            maxMb={maxMb}
          />
        ) : null}
        {step === 3 ? (
          <DesignManager
            invitation={invitation}
            maxMb={maxMb}
            isPremium={isPremium}
            planName={planName}
          />
        ) : null}
        {step === 4 ? (
          <GalleryManager
            invitationId={invitation.id}
            items={galleries}
            albums={albums}
            limit={maxGallery}
            maxMb={maxMb}
          />
        ) : null}
        {step === 5 ? (
          <AlbumManager
            invitationId={invitation.id}
            items={albums}
            photos={galleries}
            limit={maxGallery}
            maxMb={maxMb}
          />
        ) : null}
        {step === 6 ? (
          <GiftsManager invitationId={invitation.id} items={gifts} />
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={back}
          disabled={step === 0}
        >
          <ChevronLeft className="size-4" /> Sebelumnya
        </Button>
        <span className="text-xs text-muted-foreground">
          Langkah {step + 1} dari {steps.length}
        </span>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            {step === 0 ? "Simpan & Lanjut" : "Lanjut"}
            <ChevronRight className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              toast.success("Semua langkah selesai. Undangan siap digunakan.");
            }}
          >
            Selesai
          </Button>
        )}
      </div>
    </div>
  );
}