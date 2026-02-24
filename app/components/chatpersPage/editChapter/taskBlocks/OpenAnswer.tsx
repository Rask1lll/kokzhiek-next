"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";
import { useTranslations } from "next-intl";

type OpenAnswerProps = {
  widgetId: number;
};

export default function OpenAnswer({ widgetId }: OpenAnswerProps) {
  const t = useTranslations("taskEditor");
  const { questions, loading, update } = useQuestions(widgetId);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const firstQuestion = questions[0];
      if (!currentQuestion || currentQuestion.id !== firstQuestion.id) {
        setTimeout(() => {
          setCurrentQuestion(firstQuestion);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const bodyDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const answerDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const bodyTimer = bodyDebounceRef.current;
    const answerTimer = answerDebounceRef.current;
    return () => {
      if (bodyTimer) clearTimeout(bodyTimer);
      if (answerTimer) clearTimeout(answerTimer);
    };
  }, []);

  const hasCorrectAnswer =
    (currentQuestion?.data as { has_correct_answer?: boolean })
      ?.has_correct_answer ?? false;

  const correctAnswerBody = currentQuestion?.options?.[0]?.body ?? "";

  const updateQuestionBody = useCallback(
    (body: string) => {
      if (!currentQuestion?.id) return;

      setCurrentQuestion((prev) => (prev ? { ...prev, body } : prev));

      if (bodyDebounceRef.current) clearTimeout(bodyDebounceRef.current);

      const questionId = currentQuestion.id;
      bodyDebounceRef.current = setTimeout(() => {
        if (!questionId) return;
        update(questionId, { body: body ?? "" });
      }, 500);
    },
    [currentQuestion, update]
  );

  const toggleHasCorrectAnswer = useCallback(
    async (checked: boolean) => {
      if (!currentQuestion?.id) return;

      const newData = {
        ...(currentQuestion.data as object),
        has_correct_answer: checked,
      };

      if (checked) {
        // Create an option for the correct answer
        const newOptions = [
          {
            body: "",
            image_url: null,
            is_correct: true,
            match_id: null,
            group: null,
            order: 0,
          },
        ];
        const updated = await update(currentQuestion.id, {
          data: newData,
          options: newOptions,
        });
        if (updated) setCurrentQuestion(updated);
      } else {
        // Remove all options
        const updated = await update(currentQuestion.id, {
          data: newData,
          options: [],
        });
        if (updated) setCurrentQuestion(updated);
      }
    },
    [currentQuestion, update]
  );

  const updateCorrectAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion?.id) return;

      // Update UI immediately
      const newOptions = (currentQuestion.options || []).map((opt, idx) =>
        idx === 0 ? { ...opt, body: answer } : opt
      );
      setCurrentQuestion((prev) =>
        prev ? { ...prev, options: newOptions } : prev
      );

      if (answerDebounceRef.current) clearTimeout(answerDebounceRef.current);

      const questionId = currentQuestion.id;
      answerDebounceRef.current = setTimeout(() => {
        if (!questionId) return;
        const serverOptions = (currentQuestion.options || []).map((opt, idx) =>
          idx === 0 ? { ...opt, body: answer.trim() || " " } : opt
        );
        update(questionId, { options: serverOptions });
      }, 500);
    },
    [currentQuestion, update]
  );

  if (loading) {
    return (
      <div className="w-full space-y-4 p-4">
        <div className="animate-pulse">{t("loading")}</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full space-y-4 p-4 text-gray-500">
        {t("loadError")}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Question / prompt */}
      <div className="flex flex-wrap items-center w-4/5 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-base md:text-lg lg:text-xl text-gray-600">
          {t("questionLabel")}
        </div>
        <input
          spellCheck
          type="text"
          placeholder={t("questionPlaceholder")}
          className="w-full h-full outline-0 border-0 ring-0 bg-slate-200 p-2 focus:ring-2 focus:ring-blue-500"
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
        />
      </div>

      {/* Toggle: has correct answer */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={hasCorrectAnswer}
          onChange={(e) => toggleHasCorrectAnswer(e.target.checked)}
          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <span className="text-base md:text-lg lg:text-xl text-slate-700">
          {t("hasCorrectAnswer")}
        </span>
      </label>

      {/* Correct answer textarea (only when toggle is on) */}
      {hasCorrectAnswer && (
        <div className="space-y-2">
          <span className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            {t("correctAnswerLabel")}
          </span>
          <textarea
            spellCheck
            value={correctAnswerBody}
            onChange={(e) => updateCorrectAnswer(e.target.value)}
            placeholder={t("openAnswerPlaceholder")}
            className="w-full min-h-[120px] px-3 py-2 text-base md:text-lg lg:text-xl bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
        </div>
      )}
    </div>
  );
}
