"use client";

import { useState } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useAttempt } from "@/app/hooks/useAttempt";
import TaskViewWrapper from "./TaskViewWrapper";
import { getNegativeFeedback, getPositiveFeedback } from "@/app/libs/feedback";
import { useTranslations } from "next-intl";

type OpenAnswerViewProps = {
  widgetId: number;
};

export default function OpenAnswerView({ widgetId }: OpenAnswerViewProps) {
  const t = useTranslations("taskEditor");
  const { questions } = useQuestions(widgetId);
  const { loading, error, submit } = useAttempt(widgetId);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{
    is_correct: boolean;
    points_earned: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion =
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null;

  const hasCorrectAnswer =
    (currentQuestion?.data as { has_correct_answer?: boolean })
      ?.has_correct_answer ?? false;

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion?.id) return;

    setSubmitting(true);
    const response = await submit(currentQuestion.id, { answer: answer.trim() });

    if (response) {
      setResult(response);
    }
    setSubmitting(false);
  };

  if (!currentQuestion) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <textarea
        spellCheck
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          setResult(null);
        }}
        placeholder={t("studentAnswerPlaceholder")}
        className="w-full min-h-[150px] px-3 py-2 text-base md:text-lg lg:text-xl bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
      />

      {result && hasCorrectAnswer && (
        <div
          className={`mt-4 p-4 rounded-lg border-2 ${
            result.is_correct
              ? "bg-green-50 border-green-300 text-green-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {result.is_correct
                ? getPositiveFeedback()
                : getNegativeFeedback()}
            </span>
            <span className="text-sm">(+{result.points_earned} балл)</span>
          </div>
        </div>
      )}

      {result && !hasCorrectAnswer && (
        <div className="mt-4 p-4 rounded-lg border-2 bg-blue-50 border-blue-300 text-blue-800">
          <span className="text-lg font-semibold">
            {t("answerAccepted")}
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || submitting || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting || loading ? "Отправка..." : "Отправить ответ"}
        </button>
      </div>
    </TaskViewWrapper>
  );
}
