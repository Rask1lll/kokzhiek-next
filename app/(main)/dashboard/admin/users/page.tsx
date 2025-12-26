"use client";

import { useState, useEffect, useCallback } from "react";
import { FiSearch, FiTrash2, FiEdit2, FiX, FiCheck } from "react-icons/fi";
import { getAuthHeaders } from "@/app/libs/auth";

type UserRole = {
  id: number;
  alias: string;
  label: string;
  name: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
};

const ROLES = [
  { alias: "admin", label: "Админ" },
  { alias: "teacher", label: "Учитель" },
  { alias: "student", label: "Ученик" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState<string>("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users?${params}`,
        {
          headers: getAuthHeaders(),
        }
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
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async (userId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/${userId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ role: editRole }),
        }
      );

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? { ...u, role: { ...u.role, alias: editRole, label: ROLES.find((r) => r.alias === editRole)?.label || editRole } }
              : u
          )
        );
        setEditingId(null);
      }
    } catch {
      console.error("Failed to update user");
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Удалить этого пользователя?")) return;

    setDeletingId(userId);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/${userId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      console.error("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (user: User) => {
    setEditingId(user.id);
    setEditRole(user.role.alias);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditRole("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getRoleBadgeColor = (alias: string) => {
    switch (alias) {
      case "admin":
        return "bg-red-100 text-red-700";
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Управление пользователями
      </h1>

      {/* Фильтры */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени или email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[150px]"
          >
            <option value="">Все роли</option>
            {ROLES.map((role) => (
              <option key={role.alias} value={role.alias}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Загрузка...</div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Пользователи не найдены
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Дата регистрации
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Действия
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
                      {editingId === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {ROLES.map((role) => (
                              <option key={role.alias} value={role.alias}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleUpdateRole(user.id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                          >
                            <FiCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                            user.role.alias
                          )}`}
                        >
                          {user.role.label || user.role.alias}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {editingId !== user.id && (
                          <button
                            onClick={() => startEditing(user)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Изменить роль"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={deletingId === user.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Удалить"
                        >
                          <FiTrash2 className="w-4 h-4" />
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
    </div>
  );
}
