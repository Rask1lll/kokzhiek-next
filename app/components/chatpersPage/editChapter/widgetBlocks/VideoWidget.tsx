"use client";

import { WidgetData } from "@/app/types/widget";
import { useState } from "react";

type VideoWidgetProps = {
  value: WidgetData; // URL of the video
  onChange: (value: string) => void;
  onFileUpload?: (file: File) => Promise<string | null>;
  onTextChange?: (text: string) => void;
};

export default function VideoWidget({
  value,
  onChange,
  onFileUpload,
  onTextChange,
}: VideoWidgetProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [fileTitle, setFileTitle] = useState<string>(String(value.text ?? " "));

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
        console.error("Error uploading video:", err);
      } finally {
        setIsUploading(false);
      }
    } else {
      onChange(file.name);
    }
  };

  const videoUrl =
    value?.url && typeof value.url === "string" ? value.url : null;

  return (
    <div className="w-full p-2 space-y-3">
      {onTextChange && (
        <input
          type="text"
          className="p-1 text-lg w-4/5 ring-1 rounded-md ring-gray-300 bg-white"
          placeholder="Заголовок к видео"
          onChange={(e) => {
            onTextChange(e.target.value);
            setFileTitle(e.target.value);
          }}
          value={fileTitle}
        />
      )}
      {videoUrl && (
        <div className="relative w-full">
          <video
            src={videoUrl}
            controls
            className="w-full max-h-[400px] rounded-lg border border-gray-200 bg-black"
          >
            Ваш браузер не поддерживает видео
          </video>
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="font-medium">
              {value ? "Заменить видео" : "Загрузить видео"}
            </span>
          </>
        )}
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  );
}
