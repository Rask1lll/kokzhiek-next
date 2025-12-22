"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiKey, FiUsers, FiSettings } from "react-icons/fi";

const sidebarLinks = [
  { href: "/admin/keys", label: "Ключи", icon: FiKey },
  { href: "/admin/users", label: "Пользователи", icon: FiUsers },
  { href: "/admin/settings", label: "Настройки", icon: FiSettings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 px-3">
          Админ панель
        </h2>
        <nav className="space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
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
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-gray-50 p-6">{children}</main>
    </div>
  );
}
