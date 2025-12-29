"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type EmbedWidgetProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function EmbedWidget({ value, onChange }: EmbedWidgetProps) {
  const t = useTranslations("widgetTypes");
  const [isEditing, setIsEditing] = useState(!value);

  const handleSave = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="w-full p-3 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {t("embedLabel")}
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("embedPlaceholder")}
          className="w-full h-32 p-3 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
        />
        <button
          onClick={handleSave}
          disabled={!value.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {t("embedRun")}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-2 group/embed">
      <div
        className="w-full rounded-lg overflow-hidden border border-gray-200 bg-white"
        dangerouslySetInnerHTML={{ __html: value }}
      />
      <button
        onClick={() => setIsEditing(true)}
        className="mt-2 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
      >
        {t("embedEdit")}
      </button>
    </div>
  );
}
