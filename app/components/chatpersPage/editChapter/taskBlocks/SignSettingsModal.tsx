"use client";

import { useRef } from "react";
import { FiTrash2 } from "react-icons/fi";
import { useQuestionSettings, invalidateQuestions } from "./useQuestionSettings";

export function SignSettingsModal({ widgetId }: { widgetId: number }) {
  const {
    currentQuestion,
    setCurrentQuestion,
    loading,
    update,
    uploadSign,
    removeSign,
  } = useQuestionSettings(widgetId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading || !currentQuestion)
    return (
      <div className="bg-white rounded-xl p-6 text-gray-500">Загрузка...</div>
    );

  const signUrl = currentQuestion.sign_url || null;

  const signSize =
    currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    "signSize" in currentQuestion.data &&
    typeof currentQuestion.data.signSize === "string"
      ? (currentQuestion.data.signSize as string)
      : "md";

  const conditionalSignMode =
    currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    "conditionalSignMode" in currentQuestion.data &&
    typeof (currentQuestion.data as { conditionalSignMode?: string })
      .conditionalSignMode === "string"
      ? (currentQuestion.data as { conditionalSignMode?: string })
          .conditionalSignMode
      : "absolute";

  const handleImageUpload = async (file: File) => {
    if (!currentQuestion.id) return;
    const url = await uploadSign(currentQuestion.id, file);
    if (url) {
      setCurrentQuestion((prev) =>
        prev ? { ...prev, sign_url: url } : null
      );
      invalidateQuestions(widgetId);
    }
  };

  const handleImageDelete = async () => {
    if (!currentQuestion.id) return;
    const success = await removeSign(currentQuestion.id);
    if (success) {
      setCurrentQuestion((prev) =>
        prev ? { ...prev, sign_url: null } : null
      );
      invalidateQuestions(widgetId);
    }
  };

  const handleSignSizeChange = (size: string) => {
    if (!currentQuestion.id) return;
    const newData = { ...currentQuestion.data, signSize: size };
    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));
    update(currentQuestion.id, { data: newData }).then(() =>
      invalidateQuestions(widgetId)
    );
  };

  const handleSignModeChange = (mode: "inline" | "absolute") => {
    if (!currentQuestion.id) return;
    const newData = { ...currentQuestion.data, conditionalSignMode: mode };
    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));
    update(currentQuestion.id, { data: newData }).then(() =>
      invalidateQuestions(widgetId)
    );
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
            onClick={handleImageDelete}
            className="ml-auto text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <FiTrash2 className="w-3.5 h-3.5" /> Убрать
          </button>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
        >
          {signUrl ? "Заменить изображение" : "Загрузить изображение"}
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
                  onClick={() => handleSignSizeChange(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm text-gray-600 mb-2 block">
              Расположение:
            </span>
            <div className="flex gap-2">
              <button
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  conditionalSignMode === "absolute"
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleSignModeChange("absolute")}
              >
                Слева
              </button>
              <button
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                  conditionalSignMode === "inline"
                    ? "bg-green-100 border-green-300 text-green-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => handleSignModeChange("inline")}
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
