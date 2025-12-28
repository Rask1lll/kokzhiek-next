"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { FiX, FiPlus } from "react-icons/fi";
import style from "./Sort.module.css";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question, QuestionOption } from "@/app/types/question";
import { useTranslations } from "next-intl";

type SortProps = {
  widgetId: number;
};

type Column = {
  id: string;
  question: string;
};

export default function Sort({ widgetId }: SortProps) {
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
  const columnDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(
    new Map()
  );
  const cardDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup timers on unmount
  useEffect(() => {
    const debounceTimer = debounceTimerRef.current;
    const columnTimers = columnDebounceTimersRef.current;
    const cardTimers = cardDebounceTimersRef.current;

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      columnTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      columnTimers.clear();
      cardTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      cardTimers.clear();
    };
  }, []);

  // Convert question to columns structure
  const columns = useMemo(() => {
    if (!currentQuestion?.options || !currentQuestion.data) {
      return [];
    }

    const columnsData =
      (currentQuestion.data as { columns?: Column[] })?.columns || [];
    const options = currentQuestion.options;

    return columnsData.map((column) => {
      const columnOptions = options
        .filter((opt) => opt.group === column.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      return {
        ...column,
        answerCards: columnOptions.map((opt) => ({
          id: String(opt.id || opt.body),
          text: opt.body || "",
          optionId: opt.id,
        })),
      };
    });
  }, [currentQuestion]);

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

  const syncToServer = useCallback(
    (newColumns: Column[], newOptions: QuestionOption[]) => {
      if (!currentQuestion?.id) return;

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              options: newOptions,
              data: { ...prev.data, columns: newColumns },
            }
          : null
      );

      // Send to server
      update(currentQuestion.id, {
        options: newOptions,
        data: { columns: newColumns },
      });
    },
    [currentQuestion, update]
  );

  const addColumn = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const columnId = `column-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newColumn: Column = {
      id: columnId,
      question: "",
    };

    const currentColumns =
      (currentQuestion.data as { columns?: Column[] })?.columns || [];
    const newColumns = [...currentColumns, newColumn];

    // Update UI immediately
    setCurrentQuestion((prev) =>
      prev
        ? {
            ...prev,
            data: { ...prev.data, columns: newColumns },
          }
        : null
    );

    // Send to server
    update(currentQuestion.id, {
      data: { columns: newColumns },
    });
  }, [currentQuestion, update]);

  const removeColumn = useCallback(
    (columnId: string) => {
      if (!currentQuestion?.id) return;
      if (columns.length <= 2) return; // Минимум 2 столбца

      const currentColumns =
        (currentQuestion.data as { columns?: Column[] })?.columns || [];
      const newColumns = currentColumns.filter((col) => col.id !== columnId);

      // Remove all options with this group
      const newOptions = (currentQuestion.options || []).filter(
        (opt) => opt.group !== columnId
      );

      syncToServer(newColumns, newOptions);
    },
    [currentQuestion, columns.length, syncToServer]
  );

  const updateColumnQuestion = useCallback(
    (columnId: string, question: string) => {
      if (!currentQuestion?.id) return;

      const currentColumns =
        (currentQuestion.data as { columns?: Column[] })?.columns || [];
      const newColumns = currentColumns.map((col) =>
        col.id === columnId ? { ...col, question } : col
      );

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              data: { ...prev.data, columns: newColumns },
            }
          : null
      );

      // Debounce server update
      const timerKey = `column-${columnId}`;
      const existingTimer = columnDebounceTimersRef.current.get(timerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const questionId = currentQuestion.id;
      const timer = setTimeout(() => {
        if (!questionId) {
          columnDebounceTimersRef.current.delete(timerKey);
          return;
        }
        update(questionId, {
          data: { columns: newColumns },
        });
        columnDebounceTimersRef.current.delete(timerKey);
      }, 500);

      columnDebounceTimersRef.current.set(timerKey, timer);
    },
    [currentQuestion, update]
  );

  const addCardToColumn = useCallback(
    async (columnId: string) => {
      if (!currentQuestion?.id) return;

      const newOptions = [
        ...(currentQuestion.options || []),
        {
          body: "",
          image_url: null,
          is_correct: false,
          match_id: null,
          group: columnId,
          order: (currentQuestion.options || []).filter(
            (opt) => opt.group === columnId
          ).length,
        },
      ];

      // Send to server and wait for response to get IDs
      const updated = await update(currentQuestion.id, {
        options: newOptions,
      });

      if (updated) {
        setCurrentQuestion(updated);
      }
    },
    [currentQuestion, update]
  );

  const removeCardFromColumn = useCallback(
    (optionId: number | undefined) => {
      if (!currentQuestion?.id || !optionId) return;

      const newOptions = (currentQuestion.options || []).filter(
        (opt) => opt.id !== optionId
      );

      // Update order for remaining options in the same group
      const groupId = (currentQuestion.options || []).find(
        (opt) => opt.id === optionId
      )?.group;
      if (groupId) {
        const groupOptions = newOptions
          .filter((opt) => opt.group === groupId)
          .map((opt, idx) => ({ ...opt, order: idx }));
        const otherOptions = newOptions.filter((opt) => opt.group !== groupId);
        const reorderedOptions = [...otherOptions, ...groupOptions];

        // Update UI immediately
        setCurrentQuestion((prev) =>
          prev ? { ...prev, options: reorderedOptions } : null
        );

        // Send to server
        update(currentQuestion.id, { options: reorderedOptions });
      } else {
        // Update UI immediately
        setCurrentQuestion((prev) =>
          prev ? { ...prev, options: newOptions } : null
        );

        // Send to server
        update(currentQuestion.id, { options: newOptions });
      }
    },
    [currentQuestion, update]
  );

  const updateCardText = useCallback(
    (optionId: number | undefined, text: string) => {
      if (!currentQuestion?.id || optionId === undefined) return;

      // Update UI immediately
      const newOptions = (currentQuestion.options || []).map((opt) =>
        opt.id === optionId ? { ...opt, body: text } : opt
      );
      setCurrentQuestion((prev) =>
        prev ? { ...prev, options: newOptions } : prev
      );

      // Debounce server update
      const timerKey = `card-${optionId}`;
      const existingTimer = cardDebounceTimersRef.current.get(timerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const questionId = currentQuestion.id;
      const trimmedText = text.trim();
      const timer = setTimeout(() => {
        if (!questionId) {
          cardDebounceTimersRef.current.delete(timerKey);
          return;
        }
        if (trimmedText.length === 0) {
          cardDebounceTimersRef.current.delete(timerKey);
          return;
        }

        const serverOptions = newOptions.map((opt) =>
          opt.id === optionId ? { ...opt, body: trimmedText } : opt
        );

        update(questionId, { options: serverOptions });
        cardDebounceTimersRef.current.delete(timerKey);
      }, 500);

      cardDebounceTimersRef.current.set(timerKey, timer);
    },
    [currentQuestion, update]
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
          spellCheck={false}
          type="text"
          placeholder={t("questionLabel")}
          className="w-full h-full outline-0 border-0 ring-0 bg-slate-200 p-2 focus:ring-2 focus:ring-blue-500"
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">
          {t("sortColumns")}
        </span>
        <Button
          content={t("addColumn")}
          color="green"
          size="sm"
          onClick={addColumn}
        />
      </div>

      {columns.length === 0 && (
        <div className="text-sm text-slate-400 text-center py-8 border border-dashed border-slate-200 rounded-lg">
          {t("noColumns")}
        </div>
      )}

      {/* Columns grid */}
      {columns.length > 0 && (
        <div className={`grid w-full gap-4 ${style.sortGrid}`}>
          {columns.map((column) => (
            <div
              key={column.id}
              className="p-2 w-full bg-white rounded-lg border-2 border-slate-200 space-y-3"
            >
              {/* Column header */}
              <div className="flex items-center w-full justify-between gap-2">
                <input
                  spellCheck={false}
                  type="text"
                  value={column.question}
                  onChange={(e) =>
                    updateColumnQuestion(column.id, e.target.value)
                  }
                  placeholder={t("columnName")}
                  className="flex-1 px-1 py-2 w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeColumn(column.id)}
                  disabled={columns.length <= 2}
                  className="p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={t("deleteColumn")}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>

              {/* Cards in column */}
              <div className="space-y-2 min-h-[100px]">
                {column.answerCards.map((card) => (
                  <div
                    key={card.id}
                    className="flex items-center gap-2 p-0.5 bg-slate-50 rounded border border-slate-200"
                  >
                    <input
                      spellCheck={false}
                      type="text"
                      value={card.text}
                      onChange={(e) =>
                        updateCardText(card.optionId, e.target.value)
                      }
                      placeholder={t("textPlaceholder")}
                      className="flex-1 px-2 py-1 w-full text-base bg-white border border-slate-200 rounded outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeCardFromColumn(card.optionId)}
                      className="p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                      title={t("deleteCard")}
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add card button */}
                <button
                  type="button"
                  onClick={() => addCardToColumn(column.id)}
                  className="w-full flex items-center justify-center gap-1 px-3 py-2 text-sm text-slate-500 border-2 border-dashed border-slate-300 rounded hover:border-blue-400 hover:text-blue-500 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  {t("addCard")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
