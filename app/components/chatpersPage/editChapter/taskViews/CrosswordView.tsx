"use client";

import { useState, useRef } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import TaskViewWrapper from "./TaskViewWrapper";

type CrosswordViewProps = {
  widgetId: number;
  onChange?: (value: string) => void;
};

type QuestionItem = {
  id: string;
  question: string;
  answer: string;
  keyLetterIndex: number;
};

type UserAnswer = {
  answers: Record<string, string>; // questionId -> user answer
};

export default function CrosswordView({
  widgetId,
  onChange,
}: CrosswordViewProps) {
  const { questions } = useQuestions(widgetId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const data = currentQuestion?.data as
    | {
        keyword?: string;
        questions?: QuestionItem[];
      }
    | undefined;

  const questionsList = data?.questions || [];

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
    const currentRowIndex = questionsList.findIndex((q) => q.id === questionId);
    if (currentRowIndex < questionsList.length - 1) {
      const nextQuestion = questionsList[currentRowIndex + 1];
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
    ...questionsList.map((q) => q.keyLetterIndex)
  );

  if (!currentQuestion || questionsList.length === 0) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <div className="space-y-4">
        {/* Crossword grid */}
        <div className="inline-block font-mono">
          {questionsList.map((q, rowIndex) => {
            const userAnswer = answers[q.id] || "";
            const offset = maxKeyLetterIndex - q.keyLetterIndex;
            const answerLength = q.answer ? q.answer.length : 0;

            return (
              <div key={q.id} className="flex items-center gap-0.5 mb-0.5">
                <span className="w-6 text-sm md:text-base lg:text-lg text-slate-400 text-right mr-2">
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
                      spellCheck
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
                        if (
                          e.key === "Backspace" &&
                          !letter &&
                          letterIndex > 0
                        ) {
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
                      className={`w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 text-center text-base md:text-lg lg:text-xl font-bold border focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase ${
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
          {questionsList.map((q, index) => (
            <div key={q.id} className="text-base md:text-lg lg:text-xl text-gray-700">
              <span className="font-medium">{index + 1}.</span> {q.question}
            </div>
          ))}
        </div>
      </div>
    </TaskViewWrapper>
  );
}
