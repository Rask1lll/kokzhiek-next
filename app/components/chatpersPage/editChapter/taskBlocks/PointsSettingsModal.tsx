"use client";

import { useEffect, useState } from "react";
import { useQuestionSettings, invalidateQuestions } from "./useQuestionSettings";

export function PointsSettingsModal({ widgetId }: { widgetId: number }) {
  const { currentQuestion, loading, update } =
    useQuestionSettings(widgetId);
  const [localPoints, setLocalPoints] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentQuestion) {
      setLocalPoints(currentQuestion.points);
    }
  }, [currentQuestion]);

  if (loading || !currentQuestion)
    return (
      <div className="bg-white rounded-xl p-6 text-gray-500">Загрузка...</div>
    );

  const handleSave = async () => {
    if (!currentQuestion.id) return;
    const validPoints = Math.max(0, Math.min(100, localPoints));
    setSaving(true);
    await update(currentQuestion.id, { points: validPoints });
    invalidateQuestions(widgetId);
    setSaving(false);
  };

  const isDirty = localPoints !== currentQuestion.points;

  return (
    <div className="bg-white rounded-xl p-6 min-w-[300px]">
      <h3 className="text-lg font-semibold mb-4">Очки за задание</h3>
      <div className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          max="100"
          value={localPoints}
          onChange={(e) => setLocalPoints(parseInt(e.target.value) || 0)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isDirty) handleSave();
          }}
          className="w-24 px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          autoFocus
        />
        <span className="text-sm text-gray-500">макс. 100</span>
      </div>
      <button
        onClick={handleSave}
        disabled={!isDirty || saving}
        className="mt-4 px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Сохранение..." : "Сохранить"}
      </button>
    </div>
  );
}
