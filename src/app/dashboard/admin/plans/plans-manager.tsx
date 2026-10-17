"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

import { deletePlan, savePlan } from "@/app/dashboard/admin/actions";
import { ActionForm } from "@/components/forms/action-form";
import { DeleteButton } from "@/components/forms/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Plan } from "@/db/schema";
import { formatCurrency } from "@/lib/format";

function PlanFields({ plan }: { plan?: Plan }) {
  return (
    <div className="space-y-4">
      {plan ? <input type="hidden" name="id" value={plan.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`code-${plan?.id ?? "new"}`}>Kode</Label>
          <Input
            id={`code-${plan?.id ?? "new"}`}
            name="code"
            defaultValue={plan?.code}
            placeholder="premium_monthly"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`name-${plan?.id ?? "new"}`}>Nama</Label>
          <Input
            id={`name-${plan?.id ?? "new"}`}
            name="name"
            defaultValue={plan?.name}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`desc-${plan?.id ?? "new"}`}>Deskripsi</Label>
        <Input id={`desc-${plan?.id ?? "new"}`} name="description" defaultValue={plan?.description ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`price-${plan?.id ?? "new"}`}>Harga (Rp)</Label>
          <Input
            id={`price-${plan?.id ?? "new"}`}
            name="price"
            type="number"
            defaultValue={plan?.price ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`days-${plan?.id ?? "new"}`}>Durasi (hari)</Label>
          <Input
            id={`days-${plan?.id ?? "new"}`}
            name="durationDays"
            type="number"
            defaultValue={plan?.durationDays ?? 30}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`sort-${plan?.id ?? "new"}`}>Urutan</Label>
          <Input
            id={`sort-${plan?.id ?? "new"}`}
            name="sortOrder"
            type="number"
            defaultValue={plan?.sortOrder ?? 0}
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`inv-${plan?.id ?? "new"}`}>Maks undangan</Label>
          <Input
            id={`inv-${plan?.id ?? "new"}`}
            name="maxInvitations"
            type="number"
            defaultValue={plan?.maxInvitations ?? 1}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`guest-${plan?.id ?? "new"}`}>Maks tamu</Label>
          <Input
            id={`guest-${plan?.id ?? "new"}`}
            name="maxGuests"
            type="number"
            defaultValue={plan?.maxGuests ?? 50}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`gal-${plan?.id ?? "new"}`}>Maks galeri</Label>
          <Input
            id={`gal-${plan?.id ?? "new"}`}
            name="maxGallery"
            type="number"
            defaultValue={plan?.maxGallery ?? 6}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`feat-${plan?.id ?? "new"}`}>Fitur (satu per baris)</Label>
        <Textarea
          id={`feat-${plan?.id ?? "new"}`}
          name="features"
          rows={4}
          defaultValue={(plan?.features ?? []).join("\n")}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={plan?.isActive ?? true}
          className="size-4"
        />
        Paket aktif
      </label>
    </div>
  );
}

export function PlansManager({ plans }: { plans: Plan[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const editing = plans.find((plan) => plan.id === editId) ?? null;

  return (
    <div className="space-y-6">
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="size-4" /> Paket baru
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Buat paket</DialogTitle>
            <DialogDescription>Atur harga dan batas fitur.</DialogDescription>
          </DialogHeader>
          <ActionForm
            action={savePlan}
            submitLabel="Simpan paket"
            onSuccess={() => setCreateOpen(false)}
          >
            <PlanFields />
          </ActionForm>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="shadow-none">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="font-display text-lg">{plan.name}</CardTitle>
                <Badge variant={plan.isActive ? "default" : "secondary"}>
                  {plan.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{plan.code}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-display text-2xl">{formatCurrency(plan.price)}</p>
              <p className="text-muted-foreground">
                {plan.maxInvitations} undangan • {plan.maxGuests} tamu •{" "}
                {plan.maxGallery} foto
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {(plan.features ?? []).map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
              <div className="flex items-center gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditId(plan.id)}
                >
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <DeleteButton
                  action={deletePlan}
                  hidden={{ id: plan.id }}
                  label=""
                  confirmText={`Hapus paket ${plan.name}?`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={editId !== null} onOpenChange={(open) => !open && setEditId(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit paket</DialogTitle>
          </DialogHeader>
          {editing ? (
            <ActionForm
              action={savePlan}
              submitLabel="Simpan paket"
              onSuccess={() => setEditId(null)}
            >
              <PlanFields plan={editing} />
            </ActionForm>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
