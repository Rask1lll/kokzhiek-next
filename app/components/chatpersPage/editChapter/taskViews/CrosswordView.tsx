"use client";

import { useState, useRef } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useAttempt } from "@/app/hooks/useAttempt";
import TaskViewWrapper from "./TaskViewWrapper";
import { getNegativeFeedback, getPositiveFeedback } from "@/app/libs/feedback";

type CrosswordViewProps = {
  widgetId: number;
};

type QuestionItem = {
  id: string;
  question: string;
  answer: string;
  keyLetterIndex: number;
};

export default function CrosswordView({ widgetId }: CrosswordViewProps) {
  const { questions } = useQuestions(widgetId);
  const { loading, error, submit } = useAttempt(widgetId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const [result, setResult] = useState<{
    is_correct: boolean;
    points_earned: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const options = currentQuestion?.options || [];
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
    setResult(null);

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
                  <div
                    key={`empty-${i}`}
                    className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9"
                  />
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
            <div
              key={q.id}
              className="text-base md:text-lg lg:text-xl text-gray-700"
            >
              <span className="font-medium">{index + 1}.</span> {q.question}
            </div>
          ))}
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
            onClick={async () => {
              if (Object.keys(answers).length === 0 || !currentQuestion?.id) {
                return;
              }

              setSubmitting(true);
              // Для crossword нужно использовать match_id из options
              // Создаем маппинг question.id -> match_id из options
              const matchIdMap: Record<string, string> = {};
              questionsList.forEach((q) => {
                const option = options.find(
                  (opt) => opt.match_id === q.id || opt.body === q.answer
                );
                if (option?.match_id) {
                  matchIdMap[q.id] = option.match_id;
                } else {
                  // Если match_id не найден, используем question.id как есть
                  matchIdMap[q.id] = q.id;
                }
              });

              // Преобразуем answers: question.id -> match_id
              const formattedAnswers: Record<string, string> = {};
              Object.entries(answers).forEach(([questionId, answer]) => {
                const matchId = matchIdMap[questionId] || questionId;
                formattedAnswers[matchId] = answer;
              });

              const answer = { answers: formattedAnswers };

              const response = await submit(currentQuestion.id, answer);

              if (response) {
                setResult(response);
              }

              setSubmitting(false);
            }}
            disabled={
              Object.keys(answers).length === 0 || submitting || loading
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting || loading ? "Отправка..." : "Отправить ответ"}
          </button>
        </div>
      </div>
    </TaskViewWrapper>
  );
}
