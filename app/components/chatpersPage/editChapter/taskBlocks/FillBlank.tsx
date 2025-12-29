"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useCallback, useRef, useState } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question, QuestionOption } from "@/app/types/question";
import { useTranslations } from "next-intl";

type FillBlankProps = {
  widgetId: number;
};

export default function FillBlank({ widgetId }: FillBlankProps) {
  const t = useTranslations("taskEditor");
  const { questions, loading, update } = useQuestions(widgetId);

  // Get first question from array
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const firstQuestion = questions[0];
      // Only update if question ID changed
      if (!currentQuestion || currentQuestion.id !== firstQuestion.id) {
        setTimeout(() => {
          setCurrentQuestion(firstQuestion);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    const debounceTimer = debounceTimerRef.current;
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  const updateQuestionBody = useCallback(
    (body: string) => {
      if (!currentQuestion?.id) return;

      // Update UI immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, body } : prev));

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce server update
      const questionId = currentQuestion.id;
      debounceTimerRef.current = setTimeout(() => {
        if (!questionId) return;
        const trimmedBody = body.trim();
        if (trimmedBody.length === 0) return;

        update(questionId, { body: trimmedBody });
      }, 500);
    },
    [currentQuestion, update]
  );

  const insertBlank = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const blanks = (currentQuestion.data?.blanks as string[]) || [];
    const blankId = `blank${blanks.length + 1}`;
    const placeholder = `{{${blankId}}}`;
    const newBody = (currentQuestion.body || "") + placeholder;
    const newBlanks = [...blanks, blankId];

    const newOptions = [
      ...(currentQuestion.options || []),
      {
        body: "",
        image_url: null,
        is_correct: true,
        match_id: blankId,
        group: null,
        order: currentQuestion.options?.length || 0,
      },
    ];

    console.log("Sending blankId:", blankId);
    console.log(
      "New options with match_id:",
      newOptions.map((opt) => ({ body: opt.body, match_id: opt.match_id }))
    );

    // Send to server and wait for response
    const payload = {
      options: newOptions,
      body: newBody,
      data: { blanks: newBlanks },
    };

    const updated = await update(currentQuestion.id, payload);
    console.log("Response:", updated);
    if (updated) {
      // Update UI with data from server
      setCurrentQuestion(updated);
    }
  }, [currentQuestion, update]);

  const updateBlankAnswer = useCallback(
    async (blankId: string, answer: string) => {
      if (!currentQuestion?.id) return;

      const existingOption = (currentQuestion.options || []).find(
        (opt) => opt.match_id === blankId
      );

      let newOptions: QuestionOption[];
      if (existingOption) {
        // Update existing option - optimistic update
        newOptions = (currentQuestion.options || []).map((opt) =>
          opt.match_id === blankId ? { ...opt, body: answer.trim() } : opt
        );

        // Update UI immediately
        setCurrentQuestion((prev) =>
          prev ? { ...prev, options: newOptions } : prev
        );

        // Send to server
        update(currentQuestion.id, { options: newOptions });
      } else {
        // Create new option - wait for server response to get ID
        newOptions = [
          ...(currentQuestion.options || []),
          {
            body: answer.trim(),
            image_url: null,
            is_correct: true,
            match_id: blankId,
            group: null,
            order: currentQuestion.options?.length || 0,
          },
        ];

        // Send to server and wait for response to get IDs
        const updated = await update(currentQuestion.id, {
          options: newOptions,
        });
        if (updated) {
          // Update UI with data from server (includes IDs for new options)
          setCurrentQuestion(updated);
        }
      }
    },
    [currentQuestion, update]
  );

  const renderPreview = () => {
    if (!currentQuestion?.body) return null;

    const parts = (currentQuestion.body || "").split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);

      if (match) {
        const blankId = match[1];
        const option = (currentQuestion.options || []).find(
          (opt) => opt.match_id === blankId
        );

        if (option) {
          return (
            <input
              key={index}
              spellCheck
              type="text"
              value={option.body || ""}
              onChange={(e) => updateBlankAnswer(blankId, e.target.value)}
              placeholder={t("answerPlaceholderShort")}
              className="inline-block mx-1 px-2 py-0.5 w-28 text-center text-base md:text-lg lg:text-xl bg-white border-b-2 border-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Show loading state while loading
  if (loading) {
    return (
      <div className="w-full space-y-4 p-4">
        <div className="animate-pulse">{t("loading")}</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full space-y-4 p-4 text-gray-500">{t("loadError")}</div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Text editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            {t("taskLabel")}
          </span>
          <Button
            content={t("insertBlank")}
            color="blue"
            size="sm"
            onClick={insertBlank}
          />
        </div>

        <textarea
          spellCheck={true}
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
          placeholder={t("insertBlankPlaceholder")}
          className="w-full min-h-[80px] px-3 py-2 text-base md:text-lg lg:text-xl bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Preview with inputs */}
      {currentQuestion.body && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-sm md:text-base lg:text-lg text-slate-400 mb-3 block">
            {t("fillCorrectAnswers")}
          </span>
          <div className="text-lg md:text-xl lg:text-2xl text-slate-800 leading-loose">
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
}
