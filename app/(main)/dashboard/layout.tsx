"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiKey, FiBarChart2, FiUsers, FiSettings, FiShield } from "react-icons/fi";
import { useAuth } from "@/app/hooks/useAuth";
import { UserData } from "@/app/types/user";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
};

const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard/keys", label: "Ключи", icon: FiKey },
  { href: "/dashboard/stats", label: "Статистика", icon: FiBarChart2 },
];

const adminLinks: SidebarLink[] = [
  { href: "/dashboard/admin/users", label: "Пользователи", icon: FiUsers, adminOnly: true },
  { href: "/dashboard/admin/settings", label: "Настройки", icon: FiSettings, adminOnly: true },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const userData = user as unknown as UserData;
  const isAdmin = userData?.role?.alias === "admin";

  const renderLink = (link: SidebarLink) => {
    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
    const Icon = link.icon;
    return (
      <Link
        key={link.href}
        href={link.href}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <Icon className="w-5 h-5" />
        {link.label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 px-3">
          Панель управления
        </h2>

        {/* Основные разделы */}
        <nav className="space-y-1">
          {sidebarLinks.map(renderLink)}
        </nav>

        {/* Админ раздел */}
        {/* {isAdmin && ( */}
          <>
            <div className="mt-6 mb-2 px-3 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Администрирование
              </span>
            </div>
            <nav className="space-y-1">
              {adminLinks.map(renderLink)}
            </nav>
          </>
        {/* )} */}
      </aside>

      {/* Content */}
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
