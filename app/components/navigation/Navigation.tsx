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
import { BiExit } from "react-icons/bi";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations("nav");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isBurgerOpen, setIsBurgerOpen] = useState<boolean>(false);

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
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center w-full justify-between mb-3 pt-5">
          <nav className="flex items-center space-x-1">
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

          <div className="flex items-center  gap-5 ">
            {loading ? (
              <UserSkeleton />
            ) : userEmail ? (
              <div className="relative not-md:hidden" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex  sm:block  items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  type="button"
                >
                  <div className="text-left">
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
            <div className="not-md:hidden">
              <LanguageSwitcher />
            </div>
            <button
              className="md:hidden  transition-colors"
              onClick={() => setIsBurgerOpen((prev) => !prev)}
            >
              <div className=" w-5 h-0.5 bg-gray-600 mt" />
              <div className=" w-5 h-0.5 bg-gray-600 mt-1" />
              <div className=" w-5 h-0.5 bg-gray-600 mt-1" />
            </button>
          </div>
        </div>
        <div className="md:hidden border-gray-200 pt-4">
          {isBurgerOpen && canAccessDashboard(user) && (
            <div className="flex flex-col space-y-2 mb-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
              >
                <span className="w-4 h-4 rounded-full bg-gray-300" />
                <span>{t("dashboard")}</span>
              </Link>
            </div>
          )}

          {/* юзер на мобилке */}

          {loading ? (
            <UserSkeletonMobile />
          ) : userEmail && isBurgerOpen ? (
            <div className="border-t border-gray-200 pt-4 pb-4">
              <div className="flex items-center justify-between gap-2 px-3 mb-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-linear-to-r from-blue-300 to-purple-200 rounded-full flex items-center justify-center" />
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

                <LanguageSwitcher />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2 text-md mt-6 text-red-600 bg-red-50  rounded-lg transition-colors"
                type="button"
              >
                <BiExit width={20} height={20} />
                <span>{t("logout")}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
