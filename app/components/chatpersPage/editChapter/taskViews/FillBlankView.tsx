"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useAttempt } from "@/app/hooks/useAttempt";
import TaskViewWrapper from "./TaskViewWrapper";
import { getNegativeFeedback, getPositiveFeedback } from "@/app/libs/feedback";

// Inline editable span that flows with text and wraps naturally
function InlineBlankInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isComposing = useRef(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const handleInput = () => {
    if (isComposing.current) return;
    onChangeRef.current(ref.current?.textContent || "");
  };

  // Native DOM listener to reliably capture Tab before browser focus logic
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        document.execCommand("insertText", false, "\u00A0\u00A0\u00A0\u00A0");
        onChangeRef.current(el.textContent || "");
      }
    };
    el.addEventListener("keydown", onKeyDown, true);
    return () => el.removeEventListener("keydown", onKeyDown, true);
  }, []);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={true}
      onInput={handleInput}
      onCompositionStart={() => { isComposing.current = true; }}
      onCompositionEnd={() => {
        isComposing.current = false;
        handleInput();
      }}
      data-placeholder={placeholder}
      className="inline-block min-w-[80px] px-1 border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none transition-colors text-center empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
    />
  );
}

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
            <InlineBlankInput
              key={index}
              value={answers[blankId] || ""}
              onChange={(val: string) => handleInput(blankId, val)}
              placeholder="..."
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
      <div className="sm:text-lg text-sm md:text-xl text-gray-800 leading-loose whitespace-pre-wrap">
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
              {result.is_correct
                ? getPositiveFeedback()
                : getNegativeFeedback()}
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
