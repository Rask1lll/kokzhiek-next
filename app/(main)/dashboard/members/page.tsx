"use client";

import { useState, useEffect } from "react";
import { FiUsers, FiMail, FiCalendar } from "react-icons/fi";
import { useSchoolMembers } from "@/app/hooks/useSchoolMembers";
import { useAuth } from "@/app/hooks/useAuth";
import { isSchool as checkIsSchool } from "@/app/libs/roles";
import { MemberRole } from "@/app/types/member";

export default function MembersPage() {
  const { user } = useAuth();
  const { members, isLoading, getMembers } = useSchoolMembers();
  const [roleFilter, setRoleFilter] = useState<MemberRole | "">("");

  const isSchool = checkIsSchool(user);
  
  useEffect(() => {
    getMembers({
      role: roleFilter || undefined,
    });
  }, [getMembers, roleFilter]);

  const getRoleBadge = (roleAlias: MemberRole) => {
    if (roleAlias === "teacher") {
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
          Учитель
        </span>
      );
    }
    return (
      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
        Ученик
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSchool ? "Пользователи" : "Ученики"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isSchool ? "Учителя и ученики вашей школы" : "Ученики вашего класса"}
          </p>
        </div>
      </div>

      {/* Фильтры - только для школы */}
      {isSchool && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as MemberRole | "")}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[150px]"
            >
              <option value="">Все роли</option>
              <option value="teacher">Учителя</option>
              <option value="student">Ученики</option>
            </select>
          </div>
        </div>
      )}

      {/* Таблица пользователей */}
      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Загрузка...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Пользователей пока нет</p>
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
                  {isSchool && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Роль
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Дата регистрации
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {member.name
                              ? member.name[0].toUpperCase()
                              : member.email[0].toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.name || "Без имени"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FiMail className="w-4 h-4" />
                        {member.email}
                      </div>
                    </td>
                    {isSchool && (
                      <td className="px-6 py-4">
                        {getRoleBadge(member.role.alias)}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <FiCalendar className="w-4 h-4" />
                        {formatDate(member.created_at)}
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
