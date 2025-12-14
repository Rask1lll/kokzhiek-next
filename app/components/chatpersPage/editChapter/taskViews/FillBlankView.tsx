"use client";

import { useMemo, useState } from "react";

type FillBlankViewProps = {
  value: string;
  onChange?: (value: string) => void;
};

type BlankItem = {
  id: string;
  answer: string;
};

type FillBlankData = {
  text: string;
  blanks: BlankItem[];
};

type UserAnswer = {
  answers: Record<string, string>; // blankId -> user input
};

function parseData(value: string): FillBlankData {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.text === "string") {
      return parsed;
    }
  } catch {
    // Invalid JSON
  }
  return { text: "", blanks: [] };
}

export default function FillBlankView({ value, onChange }: FillBlankViewProps) {
  const data = useMemo(() => parseData(value), [value]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

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
    const parts = data.text.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const blankId = match[1];
        const blank = (data.blanks || []).find((b) => b.id === blankId);
        if (blank) {
          return (
            <input
              key={index}
              type="text"
              value={answers[blankId] || ""}
              onChange={(e) => handleInput(blankId, e.target.value)}
              placeholder="..."
              className="mx-1 px-2 py-0.5 w-28 text-center text-sm bg-white border-b-2 border-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!data.text) {
    return <p className="text-gray-400">Нет содержимого</p>;
  }

  return (
    <div className="text-base text-gray-800 leading-loose">
      {renderContent()}
    </div>
  );
}

