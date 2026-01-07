"use client";

import { useState, useMemo } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useAttempt } from "@/app/hooks/useAttempt";
import TaskViewWrapper from "./TaskViewWrapper";

type FillBlankViewProps = {
  widgetId: number;
  onChange?: (value: string) => void;
  onAnswerChange?: (value: unknown) => void;
};

type UserAnswer = {
  answers: Record<string, string>; // blankId -> user input
};

export default function FillBlankView({
  widgetId,
  onChange,
  onAnswerChange,
}: FillBlankViewProps) {
  const { questions } = useQuestions(widgetId);
  const { loading, error, submit } = useAttempt(widgetId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    is_correct: boolean;
    points_earned: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const body = currentQuestion?.body || "";
  const data = currentQuestion?.data as
    | { blanks?: string[] | Array<{ id: string }> }
    | undefined;
  // Handle both string[] and object[] formats
  const blanks = useMemo(() => {
    const blanksArray = data?.blanks || [];
    // If it's an array of objects, extract IDs; otherwise use as-is
    if (blanksArray.length > 0 && typeof blanksArray[0] === "object") {
      return (blanksArray as Array<{ id: string }>).map((b) => b.id);
    }
    return blanksArray as string[];
  }, [data?.blanks]);
  const options = useMemo(
    () => currentQuestion?.options || [],
    [currentQuestion?.options]
  );

  const handleInput = (blankId: string, userInput: string) => {
    const newAnswers = { ...answers, [blankId]: userInput };
    setAnswers(newAnswers);
    setResult(null);

    const answer: UserAnswer = { answers: newAnswers };

    if (onAnswerChange) {
      onAnswerChange(answer);
    }

    if (onChange) {
      onChange(JSON.stringify(answer));
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0 || !currentQuestion?.id) {
      return;
    }

    setSubmitting(true);
    const answer = { answers };

    const response = await submit(currentQuestion.id, answer);

    if (response) {
      setResult(response);
    }

    setSubmitting(false);
  };

  // Render text with inline inputs
  const renderContent = () => {
    const parts = body.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const blankId = match[1];
        if (blanks.includes(blankId)) {
          return (
            <input
              key={index}
              spellCheck={true}
              type="text"
              value={answers[blankId] || ""}
              onChange={(e) => {
                handleInput(blankId, e.target.value);
                e.target.style.width = `${e.target.scrollWidth}px`;
              }}
              placeholder={"..."}
              className="mx-1 px-2 py-0.5 w-28 text-center text-base md:text-lg lg:text-xl bg-white border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!currentQuestion || !body) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId} showQuestionBody={false}>
      <div className="sm:text-lg text-sm md:text-xl text-gray-800 leading-loose">
        {renderContent()}
      </div>

      {result && (
        <div
          className={`mt-4 p-4 rounded-lg border-2 ${
            result.is_correct
              ? "bg-green-50 border-green-300 text-green-800"
              : "bg-red-50 border-red-300 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              {result.is_correct ? "✓ Правильно!" : "✗ Неправильно"}
            </span>
            <span className="text-sm">(+{result.points_earned} балл)</span>
          </div>
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
          disabled={Object.keys(answers).length === 0 || submitting || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting || loading ? "Отправка..." : "Отправить ответ"}
        </button>
      </div>
    </TaskViewWrapper>
  );
}
