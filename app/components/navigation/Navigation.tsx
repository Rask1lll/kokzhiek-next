"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import UserSkeleton from "./UserSkeleton";
import UserSkeletonMobile from "./UserSkeletonMobile";
import { useAuth } from "@/app/hooks/useAuth";
import { handleLogout as apiLogout } from "@/app/services/authorization/authApi";
import { removeToken } from "@/app/libs/auth";
import { getRoleLabel } from "@/app/libs/roles";

export default function Navbar() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await apiLogout();
    removeToken();
    router.push("/auth/login");
  };

  const userEmail = user?.email;
  const userName = user?.name;
  const userRole = getRoleLabel(user);
  return (
    <header className="bg-white border-b border-gray-300 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <nav className="hidden md:flex items-center space-x-1">
            <Logo />

            {/* <Link
              href="/books"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            >
              <span className="w-4 h-4 rounded-full bg-gray-300" />
              <span>Библиотека</span>
            </Link> */}

            {/* Панель управления - для всех авторизованных */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ml-10"
            >
              {/* <span className="w-4 h-4 rounded-full bg-gray-300" /> */}
              <span>Панель управления</span>
            </Link>
          </nav>

          {/* ПРАВАЯ ЧАСТЬ */}
          <div className="flex items-center space-x-4">
            {/* Блок пользователя */}
            {loading ? (
              <UserSkeleton />
            ) : userEmail ? (
              <div className="relative">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {userName}
                    </span>
                  </div> */}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {userEmail}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      {userRole}
                    </p>
                  </div>
                </button>
              </div>
            ) : null}
            <LanguageSwitcher />

            {/* Вариант кнопки "Войти" вместо юзер-меню (оставляю отдельным блоком верстки) */}
            {/* 
              <a
                href="/auth/opic-login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Войти
              </a>
              */}

            {/* МОБИЛЬНАЯ КНОПКА МЕНЮ */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              type="button"
            >
              {/* Здесь можно подставить иконки Menu / X, сейчас просто placeholder */}
              <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
              <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
              <span className="block w-5 h-0.5 bg-gray-600" />
            </button>
          </div>
        </div>

        {/* МОБИЛЬНОЕ МЕНЮ (навигация + пользователь + язык) */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
          {/* Навигация */}
          <div className="flex flex-col space-y-2 mb-4">
            <a
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
            >
              <span className="w-4 h-4 rounded-full bg-gray-300" />
              <span>Главная</span>
            </a>
            <a
              href="/library"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
            >
              <span className="w-4 h-4 rounded-full bg-gray-300" />
              <span>Библиотека</span>
            </a>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200"
            >
              <span className="w-4 h-4 rounded-full bg-gray-300" />
              <span>Панель управления</span>
            </Link>
          </div>

          {/* Инфо о пользователе (мобайл) */}
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
                <span>Выйти</span>
              </button>
            </div>
          ) : null}

          {/* Переключатель языка (мобайл) */}
          <div className="border-t pt-4 mt-4">
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors w-full"
              type="button"
            >
              <span className="text-xl">🇷🇺</span>
              <span>Русский язык</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
