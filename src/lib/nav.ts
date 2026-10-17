import {
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  MessageSquareHeart,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  keywords?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
  admin?: boolean;
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Utama",
    items: [
      { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/invitations", label: "Undangan", icon: Mail },
      { href: "/dashboard/guests", label: "Tamu", icon: Users },
      { href: "/dashboard/rsvp", label: "RSVP", icon: CalendarCheck },
      { href: "/dashboard/wishes", label: "Ucapan", icon: MessageSquareHeart },
    ],
  },
  {
    label: "Akun",
    items: [
      { href: "/dashboard/billing", label: "Langganan", icon: CreditCard },
      { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
    ],
  },
  {
    label: "Administrasi",
    admin: true,
    items: [
      { href: "/dashboard/admin", label: "Ikhtisar admin", icon: ShieldCheck, exact: true, keywords: "admin ikhtisar" },
      { href: "/dashboard/admin/users", label: "Pengguna", icon: UsersRound },
      { href: "/dashboard/admin/plans", label: "Paket", icon: Package },
      { href: "/dashboard/admin/transactions", label: "Transaksi", icon: Receipt },
      { href: "/dashboard/admin/templates", label: "Template", icon: LayoutTemplate },
      { href: "/dashboard/admin/settings", label: "Pengaturan situs", icon: Settings, keywords: "situs web nama brand logo warna" },
    ],
  },
];

export function isActiveItem(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function currentTitle(pathname: string) {
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (isActiveItem(pathname, item)) return item.label;
    }
  }
  return "Dasbor";
}
