"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  FiCopy,
  FiCheck,
  FiKey,
  FiTrash2,
  FiX,
  FiCalendar,
  FiUser,
  FiPlus,
} from "react-icons/fi";
import { useActivationKeys } from "@/app/hooks/useActivationKeys";
import {
  ActivationKey,
  RoleType,
  ActivationKeyStatus,
  CreateActivationKeyPayload,
} from "@/app/types/activationKey";

export default function KeysPage() {
  const t = useTranslations("keysPage");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { keys, isLoading, getKeys, createKey, deleteKey } =
    useActivationKeys();
  const [roleFilter, setRoleFilter] = useState<RoleType | "">("");
  const [statusFilter, setStatusFilter] = useState<ActivationKeyStatus | "">(
    ""
  );
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdKeys, setCreatedKeys] = useState<ActivationKey[]>([]);

  useEffect(() => {
    getKeys({
      role_type: roleFilter || undefined,
      status: statusFilter || undefined,
    });
  }, [getKeys, roleFilter, statusFilter]);

  const handleCopy = async (key: string, id: number) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("deleteConfirm"))) return;

    setDeletingId(id);
    const result = await deleteKey(id);
    if (!result.success) {
      alert(result.message);
    }
    setDeletingId(null);
  };

  const getKeyStatus = (key: ActivationKey): ActivationKeyStatus => {
    if (key.is_used) return "used";
    if (key.expires_at && new Date(key.expires_at) < new Date())
      return "expired";
    return "active";
  };

  const getStatusBadge = (key: ActivationKey) => {
    const status = getKeyStatus(key);
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            {t("active")}
          </span>
        );
      case "used":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            <FiCheck className="w-3 h-3" />
            {t("used")}
          </span>
        );
      case "expired":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
            <FiX className="w-3 h-3" />
            {t("expired")}
          </span>
        );
    }
  };

  const getRoleBadge = (roleType: RoleType) => {
    if (roleType === "teacher") {
      return (
        <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
          {t("teacher")}
        </span>
      );
    }
    return (
      <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
        {t("student")}
      </span>
    );
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(
      locale === "kk" ? "kk-KZ" : "ru-RU",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const handleKeysCreated = (newKeys: ActivationKey[]) => {
    setCreatedKeys((prev) => [...newKeys, ...prev]);
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 mt-1">{t("description")}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <FiPlus className="w-5 h-5" />
          {t("createKey")}
        </button>
      </div>

      {/* Показ созданных ключей */}
      {createdKeys.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-800">
              {t("createdKeys")} ({createdKeys.length})
            </h3>
            <button
              onClick={() => setCreatedKeys([])}
              className="text-green-600 hover:text-green-800"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {createdKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-green-200"
              >
                <div className="flex items-center gap-3">
                  <code className="font-mono text-sm bg-green-100 px-2 py-1 rounded">
                    {key.key}
                  </code>
                  {getRoleBadge(key.role_type)}
                </div>
                <button
                  onClick={() => handleCopy(key.key, key.id)}
                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                >
                  {copiedId === key.id ? (
                    <>
                      <FiCheck className="w-4 h-4" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-4 h-4" />
                      {t("copy")}
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as RoleType | "")}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[150px]"
          >
            <option value="">{t("allRoles")}</option>
            <option value="teacher">{t("teacher")}</option>
            <option value="student">{t("student")}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ActivationKeyStatus | "")
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[150px]"
          >
            <option value="">{t("allStatuses")}</option>
            <option value="active">{t("activeKeys")}</option>
            <option value="used">{t("usedKeys")}</option>
            <option value="expired">{t("expiredKeys")}</option>
          </select>
        </div>
      </div>

      {/* Таблица ключей */}
      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">
            {tCommon("loading")}
          </div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center">
            <FiKey className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{t("noKeys")}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {t("createFirst")}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("keyColumn")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("typeColumn")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("statusColumn")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("usedByColumn")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("expiresColumn")}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {t("actionsColumn")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {key.key}
                        </code>
                        <button
                          onClick={() => handleCopy(key.key, key.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title={t("copy")}
                        >
                          {copiedId === key.id ? (
                            <FiCheck className="w-4 h-4 text-green-600" />
                          ) : (
                            <FiCopy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(key.role_type)}</td>
                    <td className="px-6 py-4">{getStatusBadge(key)}</td>
                    <td className="px-6 py-4">
                      {key.is_used && key.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {key.user.name
                                ? key.user.name[0].toUpperCase()
                                : key.user.email[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {key.user.name || key.user.email}
                            </p>
                            {key.used_at && (
                              <p className="text-xs text-gray-500">
                                {formatDateTime(key.used_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {key.expires_at ? (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <FiCalendar className="w-4 h-4" />
                          {formatDate(key.expires_at)}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {t("unlimited")}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!key.is_used && (
                        <button
                          onClick={() => handleDelete(key.id)}
                          disabled={deletingId === key.id}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title={tCommon("delete")}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модалка создания ключа */}
      {showCreateModal && (
        <CreateKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleKeysCreated}
          createKey={createKey}
        />
      )}
    </div>
  );
}

type CreateKeyModalProps = {
  onClose: () => void;
  onCreated: (keys: ActivationKey[]) => void;
  createKey: (
    payload: CreateActivationKeyPayload
  ) => Promise<
    | { success: true; data: ActivationKey[] }
    | { success: false; errors: Record<string, string[]>; message: string }
  >;
};

function CreateKeyModal({
  onClose,
  onCreated,
  createKey,
}: CreateKeyModalProps) {
  const t = useTranslations("keysPage");
  const [roleType, setRoleType] = useState<RoleType>("student");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setLoading(true);
    setError("");

    const payload: CreateActivationKeyPayload = {
      role_type: roleType,
    };
    if (expiresAt) {
      payload.expires_at = expiresAt;
    }

    const result = await createKey(payload);

    if (result.success) {
      onCreated(result.data);
      onClose();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {t("createModal.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("createModal.roleType")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRoleType("student")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  roleType === "student"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <FiUser className="w-5 h-5" />
                {t("student")}
              </button>
              <button
                type="button"
                onClick={() => setRoleType("teacher")}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                  roleType === "teacher"
                    ? "border-purple-500 bg-purple-50 text-purple-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600"
                }`}
              >
                <FiUser className="w-5 h-5" />
                {t("teacher")}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("createModal.expiresAt")}{" "}
              <span className="text-gray-400 font-normal">
                ({t("createModal.optional")})
              </span>
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input spellCheck={true}
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              {t("createModal.unlimitedHint")}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            {t("createModal.cancel")}
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? (
              t("createModal.creating")
            ) : (
              <>
                <FiKey className="w-5 h-5" />
                {t("createModal.create")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
