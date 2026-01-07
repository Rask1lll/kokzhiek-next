"use client";

import { useState } from "react";
import { WidgetData } from "@/app/types/widget";
import { useTranslations } from "next-intl";

type AudioWidgetProps = {
  value: WidgetData;
  onChange: (value: string) => void;
  onFileUpload?: (file: File) => Promise<string | null>;
  onTextChange?: (text: string) => void;
};

export default function AudioWidget({
  value,
  onChange,
  onFileUpload,
  onTextChange,
}: AudioWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileTitle, setFileTitle] = useState<string>(String(value?.text ?? ""));
  const t = useTranslations();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onFileUpload) {
      setIsUploading(true);
      try {
        const newUrl = await onFileUpload(file);
        if (newUrl) {
          onChange(newUrl);
        }
      } catch (err) {
        console.error("Error uploading audio:", err);
      } finally {
        setIsUploading(false);
      }
    } else {
      onChange(file.name);
    }
  };

  const audioUrl =
    value?.url && typeof value.url === "string" ? value.url : null;

  return (
    <div className="w-full flex flex-col space-y-3 p-2">
      {onTextChange && (
        <input
          type="text"
          className="p-1 text-lg w-4/5 ring-1 rounded-md ring-gray-300 bg-white"
          placeholder={t("taskEditor.audio_title")}
          onChange={(e) => {
            onTextChange(e.target.value);
            setFileTitle(e.target.value);
          }}
          value={fileTitle}
        />
      )}
      {/* Audio player */}
      {audioUrl && (
        <div className="w-full">
          <audio src={audioUrl} controls className="w-full rounded-lg">
            Ваш браузер не поддерживает аудио
          </audio>
        </div>
      )}
      {/* Upload button */}
      <label
        className={`inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors duration-100 ${
          isUploading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        {isUploading ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="font-medium">Загрузка...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span className="font-medium">
              {audioUrl ? "Заменить аудио" : "Загрузить аудио"}
            </span>
          </>
        )}
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
