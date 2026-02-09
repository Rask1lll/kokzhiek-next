"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";
import { colors } from "@/app/libs/colors";


function invalidateQuestions(widgetId: number) {
  window.dispatchEvent(
    new CustomEvent("questionsInvalidated", { detail: { widgetId } })
  );
}

function useQuestionSettings(widgetId: number) {
  const {
    questions,
    loading,
    update,
    uploadQuestionImage,
    removeQuestionImage,
    uploadSign,
    removeSign,
  } = useQuestions(widgetId);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const first = questions[0];
      if (
        !currentQuestion ||
        currentQuestion.id !== first.id ||
        currentQuestion.image_url !== first.image_url ||
        currentQuestion.sign_url !== first.sign_url ||
        JSON.stringify(currentQuestion.data) !== JSON.stringify(first.data) ||
        currentQuestion.points !== first.points
      ) {
        setCurrentQuestion(first);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  return {
    currentQuestion,
    setCurrentQuestion,
    loading,
    update,
    uploadQuestionImage,
    removeQuestionImage,
    uploadSign,
    removeSign,
  };
}

// ─── Background Settings Modal ───────────────────────────────────────────

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

// ─── Conditional Sign Settings Modal ─────────────────────────────────────

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

// ─── Hint Settings Modal ─────────────────────────────────────────────────

export function HintSettingsModal({ widgetId }: { widgetId: number }) {
  const { currentQuestion, setCurrentQuestion, loading, update } =
    useQuestionSettings(widgetId);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (loading || !currentQuestion)
    return (
      <div className="bg-white rounded-xl p-6 text-gray-500">Загрузка...</div>
    );

  const hint = (currentQuestion.data as { hint?: string })?.hint || "";

  const updateHint = (value: string) => {
    if (!currentQuestion.id) return;
    const trimmedHint = value.trim();
    const newData = {
      ...currentQuestion.data,
      hint: trimmedHint || undefined,
    };
    if (!trimmedHint) delete newData.hint;
    setCurrentQuestion((prev) => (prev ? { ...prev, data: newData } : null));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    const questionId = currentQuestion.id;
    debounceRef.current = setTimeout(() => {
      update(questionId, { data: newData }).then(() =>
        invalidateQuestions(widgetId)
      );
    }, 500);
  };

  return (
    <div className="bg-white rounded-xl p-6 min-w-[340px]">
      <h3 className="text-lg font-semibold mb-4">Подсказка</h3>
      <input
        type="text"
        value={hint}
        onChange={(e) => updateHint(e.target.value)}
        placeholder="Введите подсказку для ученика..."
        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        autoFocus
      />
      {hint && (
        <p className="mt-2 text-xs text-gray-500">
          Ученик увидит кнопку &quot;Подсказка&quot; рядом с заданием
        </p>
      )}
    </div>
  );
}

// ─── Points Settings Modal ───────────────────────────────────────────────

export function PointsSettingsModal({ widgetId }: { widgetId: number }) {
  const { currentQuestion, setCurrentQuestion, loading, update } =
    useQuestionSettings(widgetId);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (loading || !currentQuestion)
    return (
      <div className="bg-white rounded-xl p-6 text-gray-500">Загрузка...</div>
    );

  const updatePoints = useCallback(
    (points: number) => {
      if (!currentQuestion.id) return;
      const validPoints = Math.max(0, Math.min(100, points));
      setCurrentQuestion((prev) =>
        prev ? { ...prev, points: validPoints } : null
      );

      if (debounceRef.current) clearTimeout(debounceRef.current);
      const questionId = currentQuestion.id;
      debounceRef.current = setTimeout(() => {
        update(questionId, { points: validPoints }).then(() =>
          invalidateQuestions(widgetId)
        );
      }, 500);
    },
    [currentQuestion, update, widgetId, setCurrentQuestion]
  );

  return (
    <div className="bg-white rounded-xl p-6 min-w-[300px]">
      <h3 className="text-lg font-semibold mb-4">Очки за задание</h3>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          max="100"
          value={currentQuestion.points}
          onChange={(e) => updatePoints(parseInt(e.target.value) || 0)}
          className="w-24 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          autoFocus
        />
        <span className="text-sm text-gray-500">макс. 100</span>
      </div>
    </div>
  );
}
