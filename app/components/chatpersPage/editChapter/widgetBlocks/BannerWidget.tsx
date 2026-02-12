"use client";

import { useMemo, useState, useRef } from "react";
import { FiDroplet, FiImage, FiX } from "react-icons/fi";

export type BannerData = {
  text: string;
  bgColor: string;
  textColor: string;
  fontSize: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  height: number;
  bgImage?: string;
};

type BannerWidgetProps = {
  value: BannerData;
  onChange: (data: BannerData) => void;
  onFileUpload?: (file: File) => Promise<string | null>;
};

const FONT_SIZES = [
  { label: "S", value: "sm" as const },
  { label: "M", value: "lg" as const },
  { label: "L", value: "2xl" as const },
  { label: "XL", value: "3xl" as const },
];

const BG_PRESETS = [
  "#1e40af", "#0f766e", "#15803d", "#b91c1c",
  "#7c3aed", "#c2410c", "#0c4a6e", "#1e293b",
];

const TEXT_PRESETS = ["#ffffff", "#f8fafc", "#fef08a", "#fde68a", "#000000"];

const FONT_CLASS: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

export function getDefaultBanner(): BannerData {
  return {
    text: "",
    bgColor: "#1e40af",
    textColor: "#ffffff",
    fontSize: "2xl",
    height: 200,
  };
}

/** Main widget: preview + text input only */
export default function BannerWidget({ value, onChange }: BannerWidgetProps) {
  const data = useMemo(() => ({ ...getDefaultBanner(), ...value }), [value]);

  return (
    <div className="w-full space-y-2">
      {/* Live preview */}
      <div
        className={`w-full font-bold text-center break-words ${FONT_CLASS[data.fontSize] || "text-2xl"}`}
        style={{
          backgroundColor: data.bgColor,
          color: data.textColor,
          height: `${data.height}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...(data.bgImage
            ? {
                backgroundImage: `url(${data.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        {data.text || "Баннер"}
      </div>

      {/* Text input */}
      <input
        type="text"
        value={data.text}
        onChange={(e) => onChange({ ...data, text: e.target.value })}
        placeholder="Заголовок баннера..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
      />
    </div>
  );
}

/** Settings panel for WidgetMenu dropdown */
export function BannerSettings({ value, onChange, onFileUpload }: BannerWidgetProps) {
  const data = useMemo(() => ({ ...getDefaultBanner(), ...value }), [value]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (patch: Partial<BannerData>) => {
    onChange({ ...data, ...patch });
  };

  const handleBgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onFileUpload) return;

    setIsUploading(true);
    try {
      const url = await onFileUpload(file);
      if (url) {
        update({ bgImage: url });
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="px-3 py-2 space-y-3">
      {/* Background image */}
      <div>
        <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
          <FiImage className="w-3 h-3" /> Фоновое изображение
        </label>
        {data.bgImage ? (
          <div className="flex items-center gap-2">
            <img
              src={data.bgImage}
              alt="Фон"
              className="w-16 h-10 object-cover rounded border border-gray-200"
            />
            <button
              type="button"
              onClick={() => update({ bgImage: undefined })}
              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Убрать фон"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {isUploading ? "Загрузка..." : "Загрузить фото"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBgImageUpload}
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Background color */}
      <div>
        <label className="text-xs font-medium text-gray-600 flex items-center gap-1 mb-1">
          <FiDroplet className="w-3 h-3" /> Фон
        </label>
        <div className="flex items-center gap-1">
          {BG_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => update({ bgColor: color })}
              className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                data.bgColor === color ? "border-blue-500 ring-1 ring-blue-200" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={data.bgColor}
            onChange={(e) => update({ bgColor: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border-0"
          />
        </div>
      </div>

      {/* Text color */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Цвет текста</label>
        <div className="flex items-center gap-1">
          {TEXT_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => update({ textColor: color })}
              className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                data.textColor === color ? "border-blue-500 ring-1 ring-blue-200" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
          <input
            type="color"
            value={data.textColor}
            onChange={(e) => update({ textColor: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border-0"
          />
        </div>
      </div>

      {/* Font size */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Размер</label>
        <div className="flex gap-1">
          {FONT_SIZES.map((fs) => (
            <button
              key={fs.value}
              type="button"
              onClick={() => update({ fontSize: fs.value })}
              className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                data.fontSize === fs.value
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {fs.label}
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">
          Высота: {data.height}px
        </label>
        <input
          type="range"
          min="80"
          max="400"
          value={data.height}
          onChange={(e) => update({ height: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="border-t border-gray-100 my-1" />
    </div>
  );
}
