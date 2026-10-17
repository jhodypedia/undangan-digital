"use client";

import { useState } from "react";
import { Crown } from "lucide-react";
import { toast } from "sonner";

import {
  deleteUser,
  grantPremium,
  updateUserRole,
  updateUserStatus,
} from "@/app/dashboard/admin/actions";
import { DeleteButton } from "@/components/forms/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLE_LABELS, USER_ROLES, type UserRole } from "@/lib/constants";
import { formatDateTimeWIB } from "@/lib/time";

export type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  premiumUntil: Date | null;
  invitationCount: number;
  transactionCount: number;
  createdAt: Date;
  isSelf: boolean;
};

export function AdminUsersTable({ rows }: { rows: AdminUserRow[] }) {
  const [roles, setRoles] = useState<Record<number, UserRole>>(
    Object.fromEntries(rows.map((row) => [row.id, row.role])),
  );

  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pengguna</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Premium s/d</TableHead>
            <TableHead className="hidden xl:table-cell">Undangan</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <p className="font-medium">
                  {row.name} {row.isSelf ? "(Anda)" : ""}
                </p>
                <p className="text-xs text-muted-foreground">{row.email}</p>
                <p className="text-xs text-muted-foreground">
                  Daftar {formatDateTimeWIB(row.createdAt)}
                </p>
              </TableCell>
              <TableCell>
                <form
                  action={updateUserRole}
                  className="flex items-center gap-1"
                  onSubmit={() => toast.success("Role diperbarui.")}
                >
                  <input type="hidden" name="id" value={row.id} />
                  <Select
                    name="role"
                    value={roles[row.id]}
                    onValueChange={(value) =>
                      setRoles((prev) => ({ ...prev, [row.id]: value as UserRole }))
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="submit" size="sm" variant="outline">
                    Set
                  </Button>
                </form>
              </TableCell>
              <TableCell>
                <form action={updateUserStatus}>
                  <input type="hidden" name="id" value={row.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={row.status === "active" ? "suspended" : "active"}
                  />
                  <Button type="submit" size="sm" variant="ghost">
                    <Badge variant={row.status === "active" ? "default" : "destructive"}>
                      {row.status === "active" ? "Aktif" : "Ditangguhkan"}
                    </Badge>
                  </Button>
                </form>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                {row.premiumUntil ? formatDateTimeWIB(row.premiumUntil) : "-"}
              </TableCell>
              <TableCell className="hidden xl:table-cell text-sm">
                {row.invitationCount}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <form action={grantPremium}>
                    <input type="hidden" name="id" value={row.id} />
                    <input type="hidden" name="days" value="30" />
                    <Button type="submit" size="sm" variant="outline">
                      <Crown className="size-3.5" /> +30 hari
                    </Button>
                  </form>
                  {!row.isSelf ? (
                    <DeleteButton
                      action={deleteUser}
                      hidden={{ id: row.id }}
                      label=""
                      confirmText={`Hapus akun ${row.email}?`}
                    />
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
