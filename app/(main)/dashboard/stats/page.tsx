"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  FiBook,
  FiUsers,
  FiKey,
  FiFileText,
  FiTrendingUp,
  FiUserPlus,
} from "react-icons/fi";
import { getAuthHeaders } from "@/app/libs/auth";

type UserByRole = {
  role: string;
  alias: string;
  count: number;
};

type Stats = {
  totals: {
    users: number;
    books: number;
    chapters: number;
    activation_keys: number;
  };
  users_by_role: UserByRole[];
  books_by_status: {
    draft: number;
    pending: number;
    published: number;
    archived: number;
  };
  activation_keys: {
    total: number;
    used: number;
    available: number;
  };
  recent_30_days: {
    registrations: number;
    books_created: number;
  };
};

export default function StatsPage() {
  const t = useTranslations("statsPage");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("status");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/admin/stats`,
          {
            headers: getAuthHeaders(),
          }
        );
        const data = await res.json();
        if (res.ok) {
          setStats(data.data || data);
        }
      } catch {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      labelKey: "users",
      value: stats?.totals.users || 0,
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      labelKey: "books",
      value: stats?.totals.books || 0,
      icon: FiBook,
      color: "bg-purple-500",
    },
    {
      labelKey: "chapters",
      value: stats?.totals.chapters || 0,
      icon: FiFileText,
      color: "bg-green-500",
    },
    {
      labelKey: "keys",
      value: stats?.totals.activation_keys || 0,
      icon: FiKey,
      color: "bg-orange-500",
    },
  ];

  const roleLabels: Record<string, string> = {
    admin: t("admins"),
    author: t("authors"),
    teacher: t("teachers"),
    student: t("students"),
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("title")}</h1>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
          {tCommon("loading")}
        </div>
      ) : (
        <>
          {/* Карточки */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.labelKey}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {card.value}
                      </p>
                      <p className="text-sm text-gray-500">{t(card.labelKey)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Последние 30 дней */}
          {stats?.recent_30_days && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <FiUserPlus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.recent_30_days.registrations}
                    </p>
                    <p className="text-sm text-gray-500">{t("newUsers30d")}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.recent_30_days.books_created}
                    </p>
                    <p className="text-sm text-gray-500">{t("newBooks30d")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Пользователи по ролям */}
            {stats?.users_by_role && stats.users_by_role.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("usersByRole")}
                </h2>
                <div className="space-y-3">
                  {stats.users_by_role.map((item) => {
                    const total = stats.totals.users || 1;
                    const percent = Math.round((item.count / total) * 100);
                    const roleColors: Record<string, string> = {
                      admin: "bg-red-500",
                      author: "bg-green-500",
                      teacher: "bg-purple-500",
                      student: "bg-blue-500",
                    };

                    return (
                      <div key={item.alias}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            {roleLabels[item.alias] || item.role}
                          </span>
                          <span className="text-sm text-gray-500">
                            {item.count} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${roleColors[item.alias] || "bg-gray-500"}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Книги по статусу */}
            {stats?.books_by_status && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("booksByStatus")}
                </h2>
                <div className="space-y-3">
                  {Object.entries(stats.books_by_status).map(
                    ([status, count]) => {
                      const total = stats.totals.books || 1;
                      const percent = Math.round((count / total) * 100);
                      const statusColors: Record<string, string> = {
                        draft: "bg-gray-500",
                        pending: "bg-yellow-500",
                        published: "bg-green-500",
                        archived: "bg-red-500",
                      };

                      return (
                        <div key={status}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">
                              {tStatus(status)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {count} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${statusColors[status] || "bg-gray-500"}`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Ключи активации */}
            {stats?.activation_keys && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("activationKeys")}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {t("keysUsed")}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stats.activation_keys.used}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {t("keysAvailable")}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stats.activation_keys.available}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full bg-orange-500"
                      style={{
                        width: `${Math.round((stats.activation_keys.used / (stats.activation_keys.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
