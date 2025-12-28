"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiKey, FiBarChart2, FiUsers, FiSettings, FiShield } from "react-icons/fi";
import { useAuth } from "@/app/hooks/useAuth";
import { DashboardSection, canAccessSection, isAdmin } from "@/app/libs/roles";

type SidebarLink = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  section: DashboardSection;
};

const mainLinks: SidebarLink[] = [
  { href: "/dashboard/keys", labelKey: "keys", icon: FiKey, section: "keys" },
  { href: "/dashboard/members", labelKey: "members", icon: FiUsers, section: "members" },
  { href: "/dashboard/stats", labelKey: "stats", icon: FiBarChart2, section: "stats" },
];

const adminLinks: SidebarLink[] = [
  { href: "/dashboard/admin/users", labelKey: "users", icon: FiUsers, section: "admin_users" },
  { href: "/dashboard/admin/settings", labelKey: "settings", icon: FiSettings, section: "admin_settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations("dashboard");

  const accessibleMainLinks = mainLinks.filter((link) =>
    canAccessSection(user, link.section)
  );

  const accessibleAdminLinks = adminLinks.filter((link) =>
    canAccessSection(user, link.section)
  );

  const showAdminSection = isAdmin(user) && accessibleAdminLinks.length > 0;

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
        {t(link.labelKey)}
      </Link>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 px-3">
          {t("title")}
        </h2>

        {/* Основные разделы */}
        {accessibleMainLinks.length > 0 && (
          <nav className="space-y-1">
            {accessibleMainLinks.map(renderLink)}
          </nav>
        )}

        {/* Админ раздел */}
        {showAdminSection && (
          <>
            <div className="mt-6 mb-2 px-3 flex items-center gap-2">
              <FiShield className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {t("admin")}
              </span>
            </div>
            <nav className="space-y-1">
              {accessibleAdminLinks.map(renderLink)}
            </nav>
          </>
        )}
      </aside>

      {/* Content */}
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
