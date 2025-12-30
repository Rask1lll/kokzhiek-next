"use client";

import { useState, useMemo } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
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
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const body = currentQuestion?.body || "";
  const data = currentQuestion?.data as { blanks?: string[] } | undefined;
  const blanks = useMemo(() => data?.blanks || [], [data?.blanks]);
  const options = useMemo(
    () => currentQuestion?.options || [],
    [currentQuestion?.options]
  );

  const handleInput = (blankId: string, userInput: string) => {
    const newAnswers = { ...answers, [blankId]: userInput };
    setAnswers(newAnswers);

    const answer: UserAnswer = { answers: newAnswers };

    // Вызываем onAnswerChange для TaskViewWrapper
    if (onAnswerChange) {
      onAnswerChange(answer);
    }

    // Сохраняем обратную совместимость с onChange
    if (onChange) {
      onChange(JSON.stringify(answer));
    }
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length === 0) {
      console.log("Ответ не заполнен");
      return;
    }
    const answer = { answers };
    console.log("Ответ ученика (fill_blank):", answer);
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
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Отправить ответ
        </button>
      </div>
    </TaskViewWrapper>
  );
}
