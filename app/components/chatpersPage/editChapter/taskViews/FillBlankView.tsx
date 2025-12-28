"use client";

import { useState, useMemo } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import TaskViewWrapper from "./TaskViewWrapper";

type FillBlankViewProps = {
  widgetId: number;
  onChange?: (value: string) => void;
};

type UserAnswer = {
  answers: Record<string, string>; // blankId -> user input
};

export default function FillBlankView({
  widgetId,
  onChange,
}: FillBlankViewProps) {
  const { questions } = useQuestions(widgetId);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const body = currentQuestion?.body || "";
  const data = currentQuestion?.data as { blanks?: string[] } | undefined;
  const blanks = data?.blanks || [];
  const options = currentQuestion?.options || [];

  // Create a map of blankId -> option for quick lookup
  const blankOptionsMap = useMemo(() => {
    const map: Record<string, string> = {};
    blanks.forEach((blankId) => {
      const option = options.find((opt) => opt.match_id === blankId);
      if (option) {
        map[blankId] = option.body;
      }
    });
    return map;
  }, [blanks, options]);

  const handleInput = (blankId: string, userInput: string) => {
    const newAnswers = { ...answers, [blankId]: userInput };
    setAnswers(newAnswers);

    if (onChange) {
      const answer: UserAnswer = { answers: newAnswers };
      onChange(JSON.stringify(answer));
    }
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
              key={index} spellCheck={true}
              type="text"
              value={answers[blankId] || ""}
              onChange={(e) => handleInput(blankId, e.target.value)}
              placeholder={blankOptionsMap[blankId] || "..."}
              className="mx-1 px-2 py-0.5 w-28 text-center text-sm bg-white border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
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
      <div className="text-base text-gray-800 leading-loose">
        {renderContent()}
      </div>
    </TaskViewWrapper>
  );
}
