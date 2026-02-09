"use client";

import { useEffect, useRef } from "react";
import { useQuestionSettings, invalidateQuestions } from "./useQuestionSettings";

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
