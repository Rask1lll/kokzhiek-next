"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { FiAlertCircle, FiPlus, FiX } from "react-icons/fi";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";
import { useTranslations } from "next-intl";

type CrosswordProps = {
  widgetId: number;
};

type QuestionItem = {
  id: string;
  question: string;
  answer: string;
  keyLetterIndex: number; // Position of keyword letter in this answer
};

type CrosswordData = {
  keyword: string;
  questions: QuestionItem[];
};

export default function Crossword({ widgetId }: CrosswordProps) {
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
  const keywordDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(
    new Map()
  );
  const answerDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(
    new Map()
  );

  // Cleanup timers on unmount
  useEffect(() => {
    const debounceTimer = debounceTimerRef.current;
    const keywordTimer = keywordDebounceTimerRef.current;
    const questionTimers = questionDebounceTimersRef.current;
    const answerTimers = answerDebounceTimersRef.current;

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (keywordTimer) {
        clearTimeout(keywordTimer);
      }
      questionTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      questionTimers.clear();
      answerTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      answerTimers.clear();
    };
  }, []);

  // Convert question data to CrosswordData structure
  const data = useMemo((): CrosswordData => {
    if (!currentQuestion?.data) {
      return {
        keyword: "",
        questions: [],
      };
    }

    const questionData = currentQuestion.data as {
      keyword?: string;
      questions?: QuestionItem[];
    };

    return {
      keyword: questionData.keyword || "",
      questions: questionData.questions || [],
    };
  }, [currentQuestion]);

  const syncToServer = useCallback(
    (newData: Partial<CrosswordData>) => {
      if (!currentQuestion?.id) return;

      const updatedData = {
        ...data,
        ...newData,
      };

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              data: {
                keyword: updatedData.keyword,
                questions: updatedData.questions,
              },
            }
          : null
      );

      // Send to server
      update(currentQuestion.id, {
        data: {
          keyword: updatedData.keyword,
          questions: updatedData.questions,
        },
      });
    },
    [currentQuestion, data, update]
  );

  // Validate crossword
  const validation = useMemo(() => {
    const errors: string[] = [];
    const keyword = data.keyword.toUpperCase().trim();

    if (!keyword) {
      return { isValid: false, errors: [t("enterKeyword")] };
    }

    if (data.questions.length !== keyword.length) {
      errors.push(
        `${t("needQuestions", { count: keyword.length })} "${data.keyword}" (${data.questions.length})`
      );
    }

    data.questions.forEach((q, index) => {
      if (index < keyword.length) {
        const requiredLetter = keyword[index];

        const answer = (q.answer || "").toUpperCase();

        if (!q.answer) {
          errors.push(`${t("questionNumber", { number: index + 1 })}: ${t("questionEnterAnswer")}`);
        } else if (!answer.includes(requiredLetter)) {
          errors.push(
            `${t("questionNumber", { number: index + 1 })}: ${t("questionNoLetter", { answer: q.answer || "", letter: requiredLetter })}`
          );
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }, [data, t]);

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

  // Auto-find key letter position in answer
  const findKeyLetterIndex = useCallback(
    (answer: string, keyLetter: string): number => {
      return answer.toUpperCase().indexOf(keyLetter.toUpperCase());
    },
    []
  );

  const updateKeyword = useCallback(
    (keyword: string) => {
      const upperKeyword = keyword.toUpperCase();
      const newQuestions = [...data.questions];

      // Update existing questions with new key letter positions
      upperKeyword.split("").forEach((letter, index) => {
        if (newQuestions[index]) {
          const newIndex = findKeyLetterIndex(
            newQuestions[index].answer,
            letter
          );
          newQuestions[index].keyLetterIndex = newIndex >= 0 ? newIndex : 0;
        }
      });

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
                keyword: upperKeyword,
                questions: newQuestions,
              },
            }
          : null
      );

      // Debounce server update
      if (keywordDebounceTimerRef.current) {
        clearTimeout(keywordDebounceTimerRef.current);
      }

      const questionId = currentQuestion?.id;
      keywordDebounceTimerRef.current = setTimeout(() => {
        if (!questionId) return;

        update(questionId, {
          data: {
            keyword: upperKeyword,
            questions: newQuestions,
          },
        });
      }, 500);
    },
    [currentQuestion, data.questions, findKeyLetterIndex, update]
  );

  const addQuestion = useCallback(() => {
    const index = data.questions.length;

    const newQuestion: QuestionItem = {
      id: String(Date.now() + index),
      question: "",
      answer: "",
      keyLetterIndex: 0,
    };

    syncToServer({ questions: [...data.questions, newQuestion] });
  }, [data.questions, syncToServer]);

  const updateQuestion = useCallback(
    (id: string, updates: Partial<QuestionItem>) => {
      if (!currentQuestion?.id) return;

      const newQuestions = data.questions.map((q, index) => {
        if (q.id === id) {
          const updated = { ...q, ...updates };

          // Auto-update keyLetterIndex if answer changed
          if (updates.answer !== undefined && data.keyword[index]) {
            const newIndex = findKeyLetterIndex(
              updates.answer,
              data.keyword[index]
            );
            updated.keyLetterIndex = newIndex >= 0 ? newIndex : 0;
          }

          return updated;
        }
        return q;
      });

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              data: {
                ...prev.data,
                questions: newQuestions,
              },
            }
          : null
      );

      // Debounce for question text, immediate for answer
      if (updates.question !== undefined) {
        const timerKey = `question-${id}`;
        const existingTimer = questionDebounceTimersRef.current.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const questionId = currentQuestion.id;
        const trimmedQuestion = updates.question.trim();
        const timer = setTimeout(() => {
          if (!questionId) {
            questionDebounceTimersRef.current.delete(timerKey);
            return;
          }

          const serverQuestions = newQuestions.map((q) =>
            q.id === id ? { ...q, question: trimmedQuestion } : q
          );

          update(questionId, {
            data: {
              keyword: data.keyword,
              questions: serverQuestions,
            },
          });
          questionDebounceTimersRef.current.delete(timerKey);
        }, 500);

        questionDebounceTimersRef.current.set(timerKey, timer);
      } else if (updates.answer !== undefined) {
        // Debounce for answer
        const timerKey = `answer-${id}`;
        const existingTimer = answerDebounceTimersRef.current.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }

        const questionId = currentQuestion.id;
        const upperAnswer = updates.answer.toUpperCase();
        const timer = setTimeout(() => {
          if (!questionId) {
            answerDebounceTimersRef.current.delete(timerKey);
            return;
          }

          const serverQuestions = newQuestions.map((q) =>
            q.id === id ? { ...q, answer: upperAnswer } : q
          );

          update(questionId, {
            data: {
              keyword: data.keyword,
              questions: serverQuestions,
            },
          });
          answerDebounceTimersRef.current.delete(timerKey);
        }, 500);

        answerDebounceTimersRef.current.set(timerKey, timer);
      } else {
        // Immediate update for other fields
        syncToServer({ questions: newQuestions });
      }
    },
    [currentQuestion, data, findKeyLetterIndex, syncToServer, update]
  );

  const removeQuestion = useCallback(
    (id: string) => {
      syncToServer({
        questions: data.questions.filter((q) => q.id !== id),
      });
    },
    [data.questions, syncToServer]
  );

  // Calculate max offset needed for crossword alignment
  const maxKeyLetterIndex = Math.max(
    0,
    ...data.questions.map((q) => q.keyLetterIndex)
  );

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
      <div className="w-full space-y-4 p-4 text-gray-500">
        {t("loadError")}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Question input */}
      <div className="flex flex-wrap items-center w-4/5 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-sm text-gray-600">{t("questionLabel")}</div>
        <input
          type="text"
          placeholder={t("questionLabel")}
          className="w-full h-full outline-0 border-0 ring-0 bg-slate-200 p-2 focus:ring-2 focus:ring-blue-500"
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
        />
      </div>
      {/* Error display */}
      {!validation.isValid && data.keyword && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2 text-red-700">
            <FiAlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="space-y-1">
              {validation.errors.map((error, i) => (
                <p key={i} className="text-sm">
                  {error}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyword input */}
      <div className="space-y-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">
            {t("keywordLabel")}
          </span>
          <input
            type="text"
            value={data.keyword}
            onChange={(e) => updateKeyword(e.target.value.toUpperCase())}
            placeholder={t("keywordPlaceholder")}
            className="mt-1 w-full px-3 py-2 text-lg font-bold tracking-widest text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
          />
        </label>
        {data.keyword && (
          <p className="text-xs text-slate-500">
            {t("needQuestions", { count: data.keyword.length })}
          </p>
        )}
      </div>

      {/* Questions list */}
      {data.keyword && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{t("questionsLabel")}</span>
            {data.questions.length < data.keyword.length && (
              <Button
                content={t("addQuestion")}
                color="green"
                size="sm"
                onClick={addQuestion}
              />
            )}
          </div>

          {data.questions.map((q, index) => {
            const requiredLetter = data.keyword[index] || "";
            const hasLetter = (q.answer || "")
              .toUpperCase()
              .includes(requiredLetter.toUpperCase());

            return (
              <div
                key={q.id}
                className={`p-3 rounded-lg border ${
                  q.answer && !hasLetter
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-purple-100 text-purple-700 font-bold rounded">
                    {requiredLetter}
                  </span>
                  <span className="text-sm text-slate-500">
                    {t("questionNumber", { number: index + 1 })} — {t("answerMustContain")} &quot;
                    {requiredLetter}&quot;
                  </span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="ml-auto p-1 text-slate-400 hover:text-red-500"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="text"
                  value={q.question}
                  onChange={(e) =>
                    updateQuestion(q.id, { question: e.target.value })
                  }
                  onBlur={(e) =>
                    updateQuestion(q.id, { question: e.target.value.trim() })
                  }
                  placeholder={t("enterQuestion")}
                  className="w-full px-3 py-1.5 mb-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <input
                  type="text"
                  value={q.answer || ""}
                  onChange={(e) =>
                    updateQuestion(q.id, {
                      answer: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder={t("answerLabel")}
                  className={`w-full px-3 py-1.5 text-sm font-medium tracking-wider uppercase border rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    q.answer && !hasLetter
                      ? "bg-red-100 border-red-300"
                      : "bg-white border-slate-200"
                  }`}
                />
              </div>
            );
          })}

          {data.questions.length < data.keyword.length && (
            <button
              onClick={addQuestion}
              className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-purple-400 hover:text-purple-500 transition-colors flex items-center justify-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              {t("addQuestionCount", { current: data.questions.length, total: data.keyword.length })}
            </button>
          )}
        </div>
      )}

      {/* Crossword preview */}
      {validation.isValid && data.questions.length > 0 && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-400 mb-3 block">
            {t("crosswordPreview")}
          </span>

          <div className="inline-block font-mono">
            {data.questions.map((q, rowIndex) => {
              const offset = maxKeyLetterIndex - q.keyLetterIndex;
              const letters = (q.answer || "").toUpperCase().split("");

              return (
                <div key={q.id} className="flex items-center gap-0.5 mb-0.5">
                  {/* Row number */}
                  <span className="w-6 text-xs text-slate-400 text-right mr-2">
                    {rowIndex + 1}.
                  </span>

                  {/* Empty cells for offset */}
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-7 h-7" />
                  ))}

                  {/* Letter cells */}
                  {letters.map((letter, letterIndex) => (
                    <div
                      key={letterIndex}
                      className={`w-7 h-7 flex items-center justify-center text-sm font-bold border ${
                        letterIndex === q.keyLetterIndex
                          ? "bg-purple-500 text-white border-purple-600"
                          : "bg-white text-slate-700 border-slate-300"
                      }`}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-sm text-purple-600 font-medium">
            {t("keywordResult")} {data.keyword}
          </div>
        </div>
      )}
    </div>
  );
}
