"use client";

import { useRef, useState } from "react";
import { FiTrash2 } from "react-icons/fi";

type WidgetSignSettingsProps = {
  signUrl?: string;
  signSize?: string;
  signMode?: string;
  onChange: (patch: { signUrl?: string; signSize?: string; signMode?: string }) => void;
  onFileUpload?: (file: File) => Promise<string | null>;
};

export default function WidgetSignSettings({
  signUrl: initialSignUrl,
  signSize: initialSignSize = "md",
  signMode: initialSignMode = "inline",
  onChange,
  onFileUpload,
}: WidgetSignSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Local state so the modal UI updates immediately (props are a snapshot from addContent)
  const [signUrl, setSignUrl] = useState(initialSignUrl);
  const [signSize, setSignSize] = useState(initialSignSize);
  const [signMode, setSignMode] = useState(initialSignMode);

  const handleUpload = async (file: File) => {
    if (!onFileUpload) return;

    setIsUploading(true);
    try {
      const url = await onFileUpload(file);
      if (url) {
        setSignUrl(url);
        onChange({ signUrl: url });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = () => {
    setSignUrl(undefined);
    onChange({ signUrl: undefined });
  };

  const handleSizeChange = (size: string) => {
    setSignSize(size);
    onChange({ signSize: size });
  };

  const handleModeChange = (mode: string) => {
    setSignMode(mode);
    onChange({ signMode: mode });
  };

  return (
    <div className="bg-white rounded-xl p-6 min-w-[340px]">
      <h3 className="text-lg font-semibold mb-4">Условный знак</h3>

      {signUrl && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <img
            src={signUrl}
            alt="Условный знак"
            className="w-12 h-12 object-contain border border-gray-300 rounded-lg"
          />
          <span className="text-sm text-green-700">Текущий знак</span>
          <button
            onClick={handleDelete}
            className="ml-auto text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Убрать
          </button>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
        >
          {isUploading ? "Загрузка..." : signUrl ? "Заменить изображение" : "Загрузить изображение"}
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          className="hidden"
        />
      </div>

      {signUrl && (
        <>
          <div className="mb-4">
            <span className="text-sm text-gray-600 mb-2 block">Размер:</span>
            <div className="flex gap-2">
              {([
                { key: "sm", label: "S" },
                { key: "md", label: "M" },
                { key: "lg", label: "L" },
                { key: "xl", label: "XL" },
              ] as const).map((s) => (
                <button
                  key={s.key}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    signSize === s.key
                      ? "bg-green-100 border-green-300 text-green-800"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSizeChange(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm text-gray-600 mb-2 block">Расположение:</span>
            <div className="flex gap-2">
              <button
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  signMode === "absolute"
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleModeChange("absolute")}
              >
                Слева
              </button>
              <button
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  signMode === "inline"
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleModeChange("inline")}
              >
                В строке
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
