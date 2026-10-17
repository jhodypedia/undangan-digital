import { PasswordForm, ProfileForm } from "@/app/dashboard/settings/settings-forms";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS, USER_STATUSES } from "@/lib/constants";
import { formatDateTimeWIB } from "@/lib/time";

export const metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div>
      <PageHeader
        title="Pengaturan akun"
        description="Perbarui profil dan keamanan akun Anda."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-lg">Profil</CardTitle>
            <CardDescription>Informasi ini tampil pada data internal.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              name={user.name}
              phone={user.phone}
              companyName={user.companyName}
              avatarUrl={user.avatarUrl}
            />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="font-display text-lg">Ringkasan akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant={user.role === "free" ? "secondary" : "default"}>
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{USER_STATUSES.includes(user.status) ? user.status : "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Terdaftar</span>
              <span>{formatDateTimeWIB(user.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-lg">Keamanan</CardTitle>
            <CardDescription>Ganti kata sandi secara berkala.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
