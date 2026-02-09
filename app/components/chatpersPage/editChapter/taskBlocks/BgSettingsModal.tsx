"use client";

import { useEffect, useRef } from "react";
import { FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import { colors } from "@/app/libs/colors";
import { useQuestionSettings, invalidateQuestions } from "./useQuestionSettings";

export function BgSettingsModal({ widgetId }: { widgetId: number }) {
  const {
    currentQuestion,
    setCurrentQuestion,
    loading,
    update,
    uploadQuestionImage,
    removeQuestionImage,
  } = useQuestionSettings(widgetId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (colorDebounceRef.current) clearTimeout(colorDebounceRef.current);
    };
  }, []);

  if (loading || !currentQuestion)
    return (
      <div className="bg-white rounded-xl p-6 text-gray-500">Загрузка...</div>
    );

  const bgColor =
    currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    "bgColor" in currentQuestion.data &&
    typeof currentQuestion.data.bgColor === "string"
      ? currentQuestion.data.bgColor
      : "";

  const handleColorUpload = (code: string) => {
    if (!currentQuestion.id) return;
    const newData = { ...currentQuestion.data, bgColor: code };
    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));
    update(currentQuestion.id, { data: newData }).then(() =>
      invalidateQuestions(widgetId)
    );
  };

  const handleColorDelete = () => {
    if (!currentQuestion.id) return;
    const newData = { ...currentQuestion.data, bgColor: "" };
    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));
    update(currentQuestion.id, { data: newData }).then(() =>
      invalidateQuestions(widgetId)
    );
  };

  const handleImageUpload = async (file: File) => {
    if (!currentQuestion.id) return;
    const imageUrl = await uploadQuestionImage(currentQuestion.id, file);
    if (imageUrl) {
      setCurrentQuestion((prev) =>
        prev ? { ...prev, image_url: imageUrl } : null
      );
      invalidateQuestions(widgetId);
    }
  };

  const handleImageDelete = async () => {
    if (!currentQuestion.id) return;
    const success = await removeQuestionImage(currentQuestion.id);
    if (success) {
      setCurrentQuestion((prev) =>
        prev ? { ...prev, image_url: null } : null
      );
      invalidateQuestions(widgetId);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 min-w-[340px]">
      <h3 className="text-lg font-semibold mb-4">Фон задания</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {colors.map((color) => (
          <button
            key={color.code}
            className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
              bgColor === color.code
                ? "border-blue-500 ring-2 ring-blue-200"
                : "border-gray-300"
            }`}
            style={{ backgroundColor: color.code }}
            onClick={() => handleColorUpload(color.code)}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-sm text-gray-600">Свой цвет:</span>
        <input
          type="color"
          defaultValue={bgColor || "#ffffff"}
          onChange={(e) => {
            if (colorDebounceRef.current)
              clearTimeout(colorDebounceRef.current);
            colorDebounceRef.current = setTimeout(
              () => handleColorUpload(e.target.value),
              500
            );
          }}
          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
        />
      </div>

      <div className="mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          Загрузить изображение
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
            if (e.target) e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {currentQuestion.image_url && (
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-16 h-16 border border-gray-300 rounded-lg overflow-hidden">
            <Image
              src={currentQuestion.image_url}
              alt="Bg"
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={handleImageDelete}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Удалить изображение
          </button>
        </div>
      )}

      {bgColor && (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border border-gray-300"
            style={{ backgroundColor: bgColor }}
          />
          <button
            onClick={handleColorDelete}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Убрать фон
          </button>
        </div>
      )}
    </div>
  );
}
