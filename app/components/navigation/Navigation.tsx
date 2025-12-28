"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import UserSkeleton from "./UserSkeleton";
import UserSkeletonMobile from "./UserSkeletonMobile";
import { useAuth } from "@/app/hooks/useAuth";
import { handleLogout as apiLogout } from "@/app/services/authorization/authApi";
import { removeToken } from "@/app/libs/auth";
import { getRoleLabel } from "@/app/libs/roles";
import { canAccessDashboard } from "@/app/libs/permissions";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations("nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await apiLogout();
    removeToken();
    setIsMenuOpen(false);
    router.push("/auth/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const userEmail = user?.email;
  const userName = user?.name;
  const userRole = getRoleLabel(user);
  return (
    <header className="bg-white border-b border-gray-300 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <nav className="hidden md:flex items-center space-x-1">
            <Logo />
            {canAccessDashboard(user) && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-10"
              >
                <span>{t("dashboard")}</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              <UserSkeleton />
            ) : userEmail ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  type="button"
                >
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {userEmail}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {userRole}
                    </p>
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {userEmail}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{userRole}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
                        type="button"
                      >
                        <span>{t("logout")}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            <LanguageSwitcher />

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              type="button"
            >
              <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
              <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
              <span className="block w-5 h-0.5 bg-gray-600" />
            </button>
          </div>
        </div>

        <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
          <div className="flex flex-col space-y-2 mb-4">
            <a
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
            >
              <span className="w-4 h-4 rounded-full bg-gray-300" />
              <span>{t("home")}</span>
            </a>
            <a
              href="/library"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
            >
              <span className="w-4 h-4 rounded-full bg-gray-300" />
              <span>{t("library")}</span>
            </a>
            {canAccessDashboard(user) && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
              >
                <span className="w-4 h-4 rounded-full bg-gray-300" />
                <span>{t("dashboard")}</span>
              </Link>
            )}
          </div>

          {loading ? (
            <UserSkeletonMobile />
          ) : userEmail ? (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 px-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {userName
                      ? userName
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : userEmail[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {userName || userEmail}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-gray-300" />
                    {userRole}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full rounded-lg transition-colors"
                type="button"
              >
                <span className="w-4 h-4 rounded-full bg-red-300" />
                <span>{t("logout")}</span>
              </button>
            </div>
          ) : null}

        </div>
      </div>
    </header>
  );
}
