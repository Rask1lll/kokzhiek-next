"use client";

import { useEffect, useCallback, useRef, useState, useMemo } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";

type SearchWordProps = {
  widgetId: number;
};

type GridData = {
  size: number;
  Cells: Cell[];
};

type Cell = {
  id: string;
  symbol: string;
};

function CreateCell(
  value: string,
  id: string,
  onChange: (id: string, s: string) => void
) {
  return (
    <input
      type="text"
      maxLength={1}
      value={value || ""}
      onChange={(e) => {
        onChange(id, e.target.value);
      }}
      className="w-12 h-12 text-center uppercase text-xl font-bold ring-2 ring-slate-300 rounded-lg py-0.5 focus:ring-blue-500 focus:ring-2 transition-all hover:ring-slate-400 bg-white"
      placeholder=""
    />
  );
}

function generateCells(grid: Cell[], size: number): Cell[] {
  const temp = [];
  for (let index = 0; index < size * size; index++) {
    const element = grid[index];
    if (element) {
      temp.push({ id: String(index), symbol: element.symbol || "" });
    } else {
      temp.push({ id: String(index), symbol: "" });
    }
  }
  return temp;
}

export default function SearchWord({ widgetId }: SearchWordProps) {
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

  const cellDebounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const sizeDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    const debounceTimer = debounceTimerRef.current;
    const sizeTimer = sizeDebounceTimerRef.current;
    const cellTimers = cellDebounceTimersRef.current;

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      if (sizeTimer) {
        clearTimeout(sizeTimer);
      }
      cellTimers.forEach((timer) => {
        clearTimeout(timer);
      });
      cellTimers.clear();
    };
  }, []);

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

  // Convert question data to GridData structure
  const validatedData = useMemo((): GridData => {
    if (!currentQuestion?.data) {
      return {
        size: 3,
        Cells: generateCells([], 3),
      };
    }

    const questionData = currentQuestion.data as {
      size?: number;
      Cells?: Cell[];
    };

    const size = questionData.size || 3;
    const cells = questionData.Cells || [];

    return {
      size,
      Cells: generateCells(cells, size),
    };
  }, [currentQuestion]);

  const gridType = (size: number) => {
    switch (size) {
      case 3:
        return "grid-cols-3";
      case 4:
        return "grid-cols-4";
      case 5:
        return "grid-cols-5";
      case 6:
        return "grid-cols-6";
      case 7:
        return "grid-cols-7";
      case 8:
        return "grid-cols-8";
      case 9:
        return "grid-cols-9";
      case 10:
        return "grid-cols-10";
    }
  };

  const updateInput = useCallback(
    (id: string, value: string) => {
      if (!currentQuestion?.id) return;

      const updated = validatedData.Cells.map((el) =>
        el.id === id ? { ...el, symbol: value.toUpperCase() } : el
      );

      const newData = {
        ...validatedData,
        Cells: updated,
      };

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              data: {
                size: newData.size,
                Cells: newData.Cells,
              },
            }
          : null
      );

      // Debounce server update
      const timerKey = `cell-${id}`;
      const existingTimer = cellDebounceTimersRef.current.get(timerKey);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const questionId = currentQuestion.id;
      const timer = setTimeout(() => {
        if (!questionId) {
          cellDebounceTimersRef.current.delete(timerKey);
          return;
        }

        update(questionId, {
          data: {
            size: newData.size,
            Cells: newData.Cells,
          },
        });
        cellDebounceTimersRef.current.delete(timerKey);
      }, 300);

      cellDebounceTimersRef.current.set(timerKey, timer);
    },
    [currentQuestion, validatedData, update]
  );

  const updateSize = useCallback(
    (size: number) => {
      if (!currentQuestion?.id) return;

      // Clamp size between 3 and 10
      const clampedSize = Math.max(3, Math.min(10, size));

      const newCells = generateCells(validatedData.Cells, clampedSize);
      const newData = {
        size: clampedSize,
        Cells: newCells,
      };

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? {
              ...prev,
              data: {
                size: newData.size,
                Cells: newData.Cells,
              },
            }
          : null
      );

      // Debounce server update
      if (sizeDebounceTimerRef.current) {
        clearTimeout(sizeDebounceTimerRef.current);
      }

      const questionId = currentQuestion.id;
      sizeDebounceTimerRef.current = setTimeout(() => {
        if (!questionId) return;

        update(questionId, {
          data: {
            size: newData.size,
            Cells: newData.Cells,
          },
        });
      }, 500);
    },
    [currentQuestion, validatedData.Cells, update]
  );

  const decreaseSize = useCallback(() => {
    if (validatedData.size > 3) {
      updateSize(validatedData.size - 1);
    }
  }, [validatedData.size, updateSize]);

  const increaseSize = useCallback(() => {
    if (validatedData.size < 10) {
      updateSize(validatedData.size + 1);
    }
  }, [validatedData.size, updateSize]);

  // Show loading state while loading
  if (loading) {
    return (
      <div className="w-full space-y-4 p-4">
        <div className="animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full space-y-4 p-4 text-gray-500">
        Ошибка загрузки вопроса
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Question input */}
      <div className="flex flex-wrap items-center w-4/5 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-sm text-gray-600">Вопрос к заданию</div>
        <input
          type="text"
          placeholder="Вопрос к заданию"
          className="w-full h-full outline-0 border-0 ring-0 bg-slate-200 p-2 focus:ring-2 focus:ring-blue-500"
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
        />
      </div>

      {/* Grid size controls */}
      <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <label className="text-sm font-medium text-slate-700">
          Размер сетки:
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={decreaseSize}
            disabled={validatedData.size <= 3}
            className="flex items-center justify-center w-8 h-8 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Уменьшить размер"
          >
            <FiMinus className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center w-16 h-10 bg-white border border-slate-300 rounded-lg text-lg font-semibold text-slate-700">
            {validatedData.size}×{validatedData.size}
          </div>
          <button
            type="button"
            onClick={increaseSize}
            disabled={validatedData.size >= 10}
            className="flex items-center justify-center w-8 h-8 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Увеличить размер"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-slate-500 ml-auto">
          {validatedData.size * validatedData.size} ячеек
        </span>
      </div>

      {/* Grid */}
      <div className="w-full flex justify-center p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div
          className={`grid w-fit justify-center gap-2 ${gridType(
            validatedData.size
          )}`}
        >
          {validatedData.Cells.map((el) => {
            return (
              <div key={el.id} className="w-fit">
                {CreateCell(el.symbol, el.id, updateInput)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
