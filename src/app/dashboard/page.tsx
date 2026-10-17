import Link from "next/link";
import { BarChart3, CalendarCheck, Crown, Eye, Mail, Users } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getEffectiveRole } from "@/lib/auth";
import {
  getDashboardSummary,
  getDashboardTrends,
  listRsvps,
  listWishes,
  trendDelta,
} from "@/lib/queries";
import { ATTENDANCE_LABELS } from "@/lib/constants";
import { initials } from "@/lib/format";
import { formatDateTimeWIB } from "@/lib/time";

function ActivityChart({
  series,
  labels,
}: {
  series: { label: string; color: string; data: number[] }[];
  labels: string[];
}) {
  const max = Math.max(
    1,
    ...series.flatMap((item) => item.data),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-1.5 sm:gap-2">
        {series[0].data.map((_, dayIndex) => (
          <div key={dayIndex} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-32 w-full items-end justify-center gap-0.5">
              {series.map((item) => (
                <div
                  key={item.label}
                  title={`${item.label}: ${item.data[dayIndex]}`}
                  className="w-full max-w-2 rounded-t transition-all"
                  style={{
                    height: `${Math.max(2, (item.data[dayIndex] / max) * 100)}%`,
                    background: item.color,
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {labels[dayIndex]}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        {series.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ background: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [summary, recentRsvps, recentWishes, trends] = await Promise.all([
    getDashboardSummary(user.id),
    listRsvps(user.id),
    listWishes(user.id),
    getDashboardTrends(user.id),
  ]);

  const role = getEffectiveRole(user);
  const isFree = role === "free";

  return (
    <div>
      <PageHeader
        title={`Selamat datang, ${user.name.split(" ")[0]}`}
        description="Ringkasan aktivitas undangan Anda. Semua waktu ditampilkan dalam zona WIB (GMT+7)."
      >
        <Button asChild>
          <Link href="/dashboard/invitations">Kelola undangan</Link>
        </Button>
      </PageHeader>

      {isFree ? (
        <Card className="anim-rise sheen card-lift mb-6 border-accent/40 bg-accent/10 shadow-none">
          <CardContent className="flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Crown className="anim-glow mt-0.5 size-5 text-accent-foreground" />
              <div>
                <p className="font-medium">Anda memakai paket Gratis</p>
                <p className="text-sm text-muted-foreground">
                  Buka tamu tanpa batas, amplop digital, dan hilangkan watermark
                  dengan paket Premium.
                </p>
              </div>
            </div>
            <Button asChild variant="default">
              <Link href="/dashboard/billing">Upgrade ke Premium</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Undangan"
          value={summary.invitations}
          hint={`${summary.published} dipublikasikan`}
          icon={Mail}
        />
        <StatCard
          index={1}
          label="Tamu"
          value={summary.guests}
          hint="14 hari terakhir"
          icon={Users}
          delta={trendDelta(trends.guests)}
          spark={trends.guests}
        />
        <StatCard
          index={2}
          label="Konfirmasi hadir"
          value={summary.attending}
          hint="Total perkiraan kursi"
          icon={CalendarCheck}
          delta={trendDelta(trends.rsvps)}
          spark={trends.rsvps}
        />
        <StatCard
          index={3}
          label="Ucapan"
          value={summary.wishes}
          hint={`${summary.views} kali dilihat`}
          icon={Eye}
          delta={trendDelta(trends.wishes)}
          spark={trends.wishes}
        />
      </div>

      <Card className="card-lift mt-6 shadow-none">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <BarChart3 className="size-4 text-primary" /> Aktivitas 14 hari
          </CardTitle>
          <CardDescription>
            Tamu baru, konfirmasi, dan ucapan yang masuk setiap hari.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ActivityChart
            labels={trends.labels}
            series={[
              { label: "Tamu", color: "var(--primary)", data: trends.guests },
              { label: "RSVP", color: "var(--accent)", data: trends.rsvps },
              { label: "Ucapan", color: "#6b8f71", data: trends.wishes },
            ]}
          />
        </CardContent>
      </Card>

      <div className="stagger mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="card-lift shadow-none">
          <CardHeader className="border-b">
            <CardTitle className="font-display text-lg">
              Konfirmasi terbaru
            </CardTitle>
            <CardDescription>RSVP yang baru masuk dari para tamu.</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/rsvp">Lihat semua</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="divide-y">
            {recentRsvps.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada konfirmasi masuk.
              </p>
            ) : (
              recentRsvps.slice(0, 5).map(({ rsvp, invitationTitle }) => (
                <div
                  key={rsvp.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {initials(rsvp.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{rsvp.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {invitationTitle} · {formatDateTimeWIB(rsvp.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={rsvp.attendance === "hadir" ? "default" : "secondary"}
                  >
                    {ATTENDANCE_LABELS[rsvp.attendance]}
                    {rsvp.attendance === "hadir" ? ` · ${rsvp.totalGuests}` : ""}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="card-lift shadow-none">
          <CardHeader className="border-b">
            <CardTitle className="font-display text-lg">Ucapan terbaru</CardTitle>
            <CardDescription>Doa dan pesan dari tamu Anda.</CardDescription>
            <CardAction>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/wishes">Lihat semua</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="divide-y">
            {recentWishes.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada ucapan yang masuk.
              </p>
            ) : (
              recentWishes.slice(0, 5).map(({ wish }) => (
                <div key={wish.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-accent/15 text-xs font-semibold text-accent-foreground">
                      {initials(wish.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{wish.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                      {wish.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
