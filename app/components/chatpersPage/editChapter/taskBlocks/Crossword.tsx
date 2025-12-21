"use client";

import Button from "@/app/components/Button/Button";
import { useMemo } from "react";
import { FiAlertCircle, FiPlus, FiX } from "react-icons/fi";

type CrosswordProps = {
  value: string;
  onChange: (value: string) => void;
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

function parseData(value: string): CrosswordData | undefined {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.keyword === "string") {
      return parsed;
    }
  } catch {
    return;
  }
}

export default function Crossword({ value, onChange }: CrosswordProps) {
  const validateData = useMemo(() => parseData(value), [value]);

  const data: CrosswordData = validateData ?? {
    keyword: "",
    questions: [],
  };

  const updateData = (newData: CrosswordData) => {
    onChange(JSON.stringify(newData));
  };

  // Validate crossword
  const validation = useMemo(() => {
    const errors: string[] = [];
    const keyword = data.keyword.toUpperCase();

    if (!keyword) {
      return { isValid: false, errors: ["Введите ключевое слово"] };
    }

    if (data.questions.length !== keyword.length) {
      errors.push(
        `Нужно ${keyword.length} вопросов для слова "${data.keyword}" (сейчас ${data.questions.length})`
      );
    }

    data.questions.forEach((q, index) => {
      if (index < keyword.length) {
        const requiredLetter = keyword[index];
        const answer = q.answer.toUpperCase();

        if (!q.answer) {
          errors.push(`Вопрос ${index + 1}: введите ответ`);
        } else if (!answer.includes(requiredLetter)) {
          errors.push(
            `Вопрос ${index + 1}: ответ "${
              q.answer
            }" не содержит букву "${requiredLetter}"`
          );
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }, [data]);

  // Auto-find key letter position in answer
  const findKeyLetterIndex = (answer: string, keyLetter: string): number => {
    return answer.toUpperCase().indexOf(keyLetter.toUpperCase());
  };

  const updateKeyword = (keyword: string) => {
    const newQuestions = [...data.questions];

    // Update existing questions with new key letter positions
    keyword.split("").forEach((letter, index) => {
      if (newQuestions[index]) {
        const newIndex = findKeyLetterIndex(newQuestions[index].answer, letter);
        newQuestions[index].keyLetterIndex = newIndex >= 0 ? newIndex : 0;
      }
    });

    updateData({ keyword, questions: newQuestions });
  };

  const addQuestion = () => {
    const index = data.questions.length;

    const newQuestion: QuestionItem = {
      id: String(index),
      question: "",
      answer: "",
      keyLetterIndex: 0,
    };

    updateData({
      ...data,
      questions: [...data.questions, newQuestion],
    });
  };

  const updateQuestion = (id: string, updates: Partial<QuestionItem>) => {
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

    updateData({ ...data, questions: newQuestions });
  };

  const removeQuestion = (id: string) => {
    updateData({
      ...data,
      questions: data.questions.filter((q) => q.id !== id),
    });
  };

  // Calculate max offset needed for crossword alignment
  const maxKeyLetterIndex = Math.max(
    0,
    ...data.questions.map((q) => q.keyLetterIndex)
  );

  return (
    <div className="w-full space-y-4">
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
            Ключевое слово (финальный ответ):
          </span>
          <input
            type="text"
            value={data.keyword}
            onChange={(e) => updateKeyword(e.target.value.toUpperCase())}
            placeholder="Например: ВЕСНА"
            className="mt-1 w-full px-3 py-2 text-lg font-bold tracking-widest text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
          />
        </label>
        {data.keyword && (
          <p className="text-xs text-slate-500">
            Нужно {data.keyword.length} вопросов. Каждый ответ должен содержать
            соответствующую букву.
          </p>
        )}
      </div>

      {/* Questions list */}
      {data.keyword && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Вопросы:</span>
            {data.questions.length < data.keyword.length && (
              <Button
                content="+ Добавить вопрос"
                color="green"
                size="sm"
                onClick={addQuestion}
              />
            )}
          </div>

          {data.questions.map((q, index) => {
            const requiredLetter = data.keyword[index] || "";
            const hasLetter = q.answer
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
                    Вопрос {index + 1} — ответ должен содержать &quot
                    {requiredLetter}&quot
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
                  placeholder="Введите вопрос..."
                  className="w-full px-3 py-1.5 mb-2 text-sm bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <input
                  type="text"
                  value={q.answer}
                  onChange={(e) =>
                    updateQuestion(q.id, {
                      answer: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Ответ..."
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
              Добавить вопрос ({data.questions.length}/{data.keyword.length})
            </button>
          )}
        </div>
      )}

      {/* Crossword preview */}
      {validation.isValid && data.questions.length > 0 && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-400 mb-3 block">
            Предпросмотр кроссворда:
          </span>

          <div className="inline-block font-mono">
            {data.questions.map((q, rowIndex) => {
              const offset = maxKeyLetterIndex - q.keyLetterIndex;
              const letters = q.answer.toUpperCase().split("");

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
            Ключевое слово: {data.keyword}
          </div>
        </div>
      )}
    </div>
  );
}
