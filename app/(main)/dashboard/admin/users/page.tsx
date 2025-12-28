"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { FiSearch, FiEdit2, FiX, FiCheck } from "react-icons/fi";
import { getAuthHeaders } from "@/app/libs/auth";
import { useAlertStore } from "@/app/store/alertStore";

type Role = {
  id: number;
  alias: string;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
};

export default function AdminUsersPage() {
  const t = useTranslations("adminUsersPage");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | null>(null);
  const [editRoleId, setEditRoleId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Загрузка ролей
  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/admin/roles`,
          { headers: getAuthHeaders() }
        );
        const data = await res.json();
        if (res.ok) {
          setRoles(data.data || data || []);
        }
      } catch {
        console.error("Failed to fetch roles");
      }
    }
    fetchRoles();
  }, []);

  // Загрузка пользователей
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (roleFilter) params.append("role_id", String(roleFilter));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/admin/users?${params}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (res.ok) {
        setUsers(data.data || data || []);
      }
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = () => {
    setSearchQuery(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setEditRoleId(user.role.id);
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setEditRoleId(null);
  };

  const handleModalUpdateRole = async () => {
    if (!selectedUser || !editRoleId) return;

    setSavingId(selectedUser.id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/admin/users/${selectedUser.id}/role`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({ role_id: editRoleId }),
        }
      );

      if (res.ok) {
        const newRole = roles.find((r) => r.id === editRoleId);
        if (newRole) {
          setUsers((prev) =>
            prev.map((u) =>
              u.id === selectedUser.id ? { ...u, role: newRole } : u
            )
          );
        }
        closeUserModal();
        showAlert(t("roleUpdated"), "success", 3000);
      }
    } catch {
      console.error("Failed to update user role");
    } finally {
      setSavingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === "kk" ? "kk-KZ" : "ru-RU",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getRoleBadgeColor = (alias: string) => {
    switch (alias) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "school_admin":
        return "bg-orange-100 text-orange-700";
      case "teacher":
        return "bg-purple-100 text-purple-700";
      case "student":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("title")}</h1>

      {/* Фильтры */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                spellCheck
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <FiSearch className="w-5 h-5" />
              <span className="hidden sm:inline">{t("searchButton")}</span>
            </button>
          </div>
          <select
            value={roleFilter ?? ""}
            onChange={(e) =>
              setRoleFilter(e.target.value ? Number(e.target.value) : null)
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[150px]"
          >
            <option value="">{t("allRoles")}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            {tCommon("loading")}
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">{t("noUsers")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("userColumn")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("emailColumn")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("roleColumn")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("dateColumn")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t("actionsColumn")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.name
                              ? user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              : user.email[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                          user.role.alias
                        )}`}
                      >
                        {user.role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openUserModal(user)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t("changeRole")}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно пользователя */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeUserModal}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <button
              onClick={closeUserModal}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <FiX className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-semibold">
                  {selectedUser.name
                    ? selectedUser.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : selectedUser.email[0].toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedUser.name || "—"}
              </h2>
              <p className="text-gray-500">{selectedUser.email}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("roleColumn")}
                </label>
                <select
                  value={editRoleId ?? ""}
                  onChange={(e) => setEditRoleId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-500">
                {t("dateColumn")}: {formatDate(selectedUser.created_at)}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeUserModal}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleModalUpdateRole}
                disabled={
                  savingId === selectedUser.id ||
                  editRoleId === selectedUser.role.id
                }
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingId === selectedUser.id ? (
                  tCommon("loading")
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    {tCommon("save")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
