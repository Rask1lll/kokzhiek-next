"use client";

import { useState, useEffect } from "react";
import { FiBook, FiUsers, FiKey, FiFileText } from "react-icons/fi";
import { getAuthHeaders } from "@/app/libs/auth";

type Stats = {
  total_users: number;
  total_books: number;
  total_chapters: number;
  total_keys: number;
  users_by_role: Record<string, number>;
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/stats`,
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
      label: "Пользователей",
      value: stats?.total_users || 0,
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      label: "Книг",
      value: stats?.total_books || 0,
      icon: FiBook,
      color: "bg-purple-500",
    },
    {
      label: "Глав",
      value: stats?.total_chapters || 0,
      icon: FiFileText,
      color: "bg-green-500",
    },
    {
      label: "Ключей",
      value: stats?.total_keys || 0,
      icon: FiKey,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Статистика</h1>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
          Загрузка...
        </div>
      ) : (
        <>
          {/* Карточки */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
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
                      <p className="text-sm text-gray-500">{card.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Пользователи по ролям */}
          {stats?.users_by_role && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Пользователи по ролям
              </h2>
              <div className="space-y-3">
                {Object.entries(stats.users_by_role).map(([role, count]) => {
                  const total = stats.total_users || 1;
                  const percent = Math.round((count / total) * 100);
                  const roleLabels: Record<string, string> = {
                    admin: "Админы",
                    teacher: "Учителя",
                    student: "Ученики",
                  };
                  const roleColors: Record<string, string> = {
                    admin: "bg-red-500",
                    teacher: "bg-purple-500",
                    student: "bg-blue-500",
                  };

                  return (
                    <div key={role}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {roleLabels[role] || role}
                        </span>
                        <span className="text-sm text-gray-500">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${roleColors[role] || "bg-gray-500"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
