"use client";

import { useMemo, useState, useRef } from "react";

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
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const getInputRef = (questionId: string, letterIndex: number) => {
    return `${questionId}-${letterIndex}`;
  };

  const focusNextInput = (
    questionId: string,
    currentLetterIndex: number,
    answerLength: number
  ) => {
    // Try next cell in same row
    if (currentLetterIndex < answerLength - 1) {
      const nextRef = inputRefs.current.get(
        getInputRef(questionId, currentLetterIndex + 1)
      );
      if (nextRef) {
        nextRef.focus();
        return;
      }
    }

    // Try first cell of next row
    const currentRowIndex = data.questions.findIndex(
      (q) => q.id === questionId
    );
    if (currentRowIndex < data.questions.length - 1) {
      const nextQuestion = data.questions[currentRowIndex + 1];
      const nextRef = inputRefs.current.get(getInputRef(nextQuestion.id, 0));
      if (nextRef) {
        nextRef.focus();
      }
    }
  };

  const handleInput = (
    questionId: string,
    userAnswer: string,
    letterIndex?: number,
    answerLength?: number
  ) => {
    const newAnswers = { ...answers, [questionId]: userAnswer.toUpperCase() };
    setAnswers(newAnswers);

    if (onChange) {
      const answer: UserAnswer = { answers: newAnswers };
      onChange(JSON.stringify(answer));
    }

    // Auto-focus next cell if letter was entered
    if (
      letterIndex !== undefined &&
      answerLength !== undefined &&
      userAnswer[letterIndex]
    ) {
      focusNextInput(questionId, letterIndex, answerLength);
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
                const refKey = getInputRef(q.id, letterIndex);

                return (
                  <input
                    key={letterIndex}
                    ref={(el) => {
                      if (el) {
                        inputRefs.current.set(refKey, el);
                      } else {
                        inputRefs.current.delete(refKey);
                      }
                    }}
                    type="text"
                    maxLength={1}
                    value={letter}
                    onChange={(e) => {
                      const chars = userAnswer
                        .padEnd(answerLength, " ")
                        .split("");
                      chars[letterIndex] = e.target.value.toUpperCase();
                      const newAnswer = chars.join("").trimEnd();
                      handleInput(q.id, newAnswer, letterIndex, answerLength);
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace - go to previous cell
                      if (e.key === "Backspace" && !letter && letterIndex > 0) {
                        const prevRef = inputRefs.current.get(
                          getInputRef(q.id, letterIndex - 1)
                        );
                        if (prevRef) {
                          prevRef.focus();
                        }
                      }
                      // Handle arrow keys
                      if (
                        e.key === "ArrowRight" &&
                        letterIndex < answerLength - 1
                      ) {
                        const nextRef = inputRefs.current.get(
                          getInputRef(q.id, letterIndex + 1)
                        );
                        if (nextRef) nextRef.focus();
                      }
                      if (e.key === "ArrowLeft" && letterIndex > 0) {
                        const prevRef = inputRefs.current.get(
                          getInputRef(q.id, letterIndex - 1)
                        );
                        if (prevRef) prevRef.focus();
                      }
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
