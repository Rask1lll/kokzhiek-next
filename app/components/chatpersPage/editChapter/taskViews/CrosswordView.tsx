"use client";

import { useMemo, useState } from "react";

type CrosswordViewProps = {
  value: string;
  onChange?: (value: string) => void;
};

type QuestionItem = {
  id: string;
  question: string;
  answer: string;
  keyLetterIndex: number;
};

type CrosswordData = {
  keyword: string;
  questions: QuestionItem[];
};

type UserAnswer = {
  answers: Record<string, string>; // questionId -> user answer
};

function parseData(value: string): CrosswordData {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.keyword === "string") {
      return parsed;
    }
  } catch {
    // Invalid JSON
  }
  return { keyword: "", questions: [] };
}

export default function CrosswordView({ value, onChange }: CrosswordViewProps) {
  const data = useMemo(() => parseData(value), [value]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleInput = (questionId: string, userAnswer: string) => {
    const newAnswers = { ...answers, [questionId]: userAnswer.toUpperCase() };
    setAnswers(newAnswers);

    if (onChange) {
      const answer: UserAnswer = { answers: newAnswers };
      onChange(JSON.stringify(answer));
    }
  };

  // Calculate max offset needed for crossword alignment
  const maxKeyLetterIndex = Math.max(
    0,
    ...data.questions.map((q) => q.keyLetterIndex)
  );

  if (data.questions.length === 0) {
    return <p className="text-gray-400">Кроссворд не настроен</p>;
  }

  return (
    <div className="space-y-4">
      {/* Crossword grid */}
      <div className="inline-block font-mono">
        {data.questions.map((q, rowIndex) => {
          const userAnswer = answers[q.id] || "";
          const offset = maxKeyLetterIndex - q.keyLetterIndex;
          const answerLength = q.answer.length;

          return (
            <div key={q.id} className="flex items-center gap-0.5 mb-0.5">
              <span className="w-6 text-xs text-slate-400 text-right mr-2">
                {rowIndex + 1}.
              </span>

              {/* Empty cells for offset */}
              {Array.from({ length: offset }).map((_, i) => (
                <div key={`empty-${i}`} className="w-7 h-7" />
              ))}

              {/* Letter cells */}
              {Array.from({ length: answerLength }).map((_, letterIndex) => {
                const isKeyLetter = letterIndex === q.keyLetterIndex;
                const letter = userAnswer[letterIndex] || "";

                return (
                  <input
                    key={letterIndex}
                    type="text"
                    maxLength={1}
                    value={letter}
                    onChange={(e) => {
                      const chars = userAnswer.split("");
                      chars[letterIndex] = e.target.value.toUpperCase();
                      handleInput(q.id, chars.join(""));
                    }}
                    className={`w-7 h-7 text-center text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase ${
                      isKeyLetter
                        ? "bg-purple-100 border-purple-400 text-purple-700"
                        : "bg-white border-slate-300 text-slate-700"
                    }`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Questions */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        {data.questions.map((q, index) => (
          <div key={q.id} className="text-sm text-gray-700">
            <span className="font-medium">{index + 1}.</span> {q.question}
          </div>
        ))}
      </div>
    </div>
  );
}

