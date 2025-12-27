"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FiSave, FiCheck } from "react-icons/fi";
import { getAuthHeaders } from "@/app/libs/auth";

type Settings = {
  site_name: string;
  site_description: string;
  registration_enabled: boolean;
  require_registration_key: boolean;
  default_user_role: string;
  max_books_per_user: number;
  max_chapters_per_book: number;
};

const DEFAULT_SETTINGS: Settings = {
  site_name: "Көкжиек",
  site_description: "Образовательная платформа",
  registration_enabled: true,
  require_registration_key: false,
  default_user_role: "student",
  max_books_per_user: 10,
  max_chapters_per_book: 50,
};

export default function SettingsPage() {
  const t = useTranslations("adminSettingsPage");
  const tCommon = useTranslations("common");
  const tRoles = useTranslations("membersPage");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/settings`,
          {
            headers: getAuthHeaders(),
          }
        );
        const data = await res.json();
        if (res.ok && data.data) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.data });
        }
      } catch {
        console.error("Failed to fetch settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/settings`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(settings),
        }
      );

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      console.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("title")}</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">
          {tCommon("loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {saved ? (
            <>
              <FiCheck className="w-5 h-5" />
              {t("saved")}
            </>
          ) : (
            <>
              <FiSave className="w-5 h-5" />
              {saving ? t("saving") : t("save")}
            </>
          )}
        </button>
      </div>

      {/* Основные настройки */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t("mainSettings")}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("siteName")}
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => updateSetting("site_name", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("siteDescription")}
            </label>
            <textarea
              value={settings.site_description}
              onChange={(e) => updateSetting("site_description", e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
          </div>
        </div>
      </div>

      {/* Регистрация */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t("registration")}
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">
                {t("registrationOpen")}
              </p>
              <p className="text-sm text-gray-500">
                {t("registrationOpenDesc")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.registration_enabled}
              onChange={(e) =>
                updateSetting("registration_enabled", e.target.checked)
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900">
                {t("requireKey")}
              </p>
              <p className="text-sm text-gray-500">
                {t("requireKeyDesc")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.require_registration_key}
              onChange={(e) =>
                updateSetting("require_registration_key", e.target.checked)
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("defaultRole")}
            </label>
            <select
              value={settings.default_user_role}
              onChange={(e) => updateSetting("default_user_role", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="student">{tRoles("student")}</option>
              <option value="teacher">{tRoles("teacher")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Лимиты */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {t("limits")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("maxBooksPerUser")}
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={settings.max_books_per_user}
              onChange={(e) =>
                updateSetting("max_books_per_user", parseInt(e.target.value) || 10)
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("maxChaptersPerBook")}
            </label>
            <input
              type="number"
              min={1}
              max={200}
              value={settings.max_chapters_per_book}
              onChange={(e) =>
                updateSetting("max_chapters_per_book", parseInt(e.target.value) || 50)
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
