"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question, QuestionOption } from "@/app/types/question";

type DragDropProps = {
  widgetId: number;
};

export default function DragDrop({ widgetId }: DragDropProps) {
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
  const [showHint, setShowHint] = useState(false);

  // Cleanup timers on unmount
  useEffect(() => {
    const debounceTimer = debounceTimerRef.current;
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
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

  const addCell = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const cells = (currentQuestion.data?.cells as string[]) || [];
    const cellId = String(cells.length);
    const placeholder = `{{{${cellId}}}}`;
    const newBody = (currentQuestion.body || "") + placeholder;
    const newCells = [...cells, cellId];

    // Create new option for this cell
    const newOptions = [
      ...(currentQuestion.options || []),
      {
        body: "",
        image_url: null,
        is_correct: true,
        match_id: null,
        group: null,
        order: parseInt(cellId),
      },
    ];

    // Send to server and wait for response
    const updated = await update(currentQuestion.id, {
      options: newOptions,
      body: newBody,
      data: { cells: newCells },
    });
    if (updated) {
      // Update UI with data from server
      setCurrentQuestion(updated);
    }
  }, [currentQuestion, update]);

  const updateCellAnswer = useCallback(
    async (cellId: string, answer: string) => {
      if (!currentQuestion?.id) return;

      // Find option with matching order (order corresponds to cellId)
      const cellIndex = parseInt(cellId);
      const existingOption = (currentQuestion.options || []).find(
        (opt) => opt.order === cellIndex
      );

      let newOptions: QuestionOption[];
      if (existingOption) {
        // Update existing option - optimistic update
        newOptions = (currentQuestion.options || []).map((opt) =>
          opt.order === cellIndex ? { ...opt, body: answer.trim() } : opt
        );

        // Update UI immediately
        setCurrentQuestion((prev) =>
          prev ? { ...prev, options: newOptions } : prev
        );

        // Send to server
        update(currentQuestion.id, { options: newOptions });
      } else {
        // Create new option - wait for server response to get ID
        newOptions = [
          ...(currentQuestion.options || []),
          {
            body: answer.trim(),
            image_url: null,
            is_correct: true,
            match_id: null,
            group: null,
            order: cellIndex,
          },
        ];

        // Send to server and wait for response to get IDs
        const updated = await update(currentQuestion.id, {
          options: newOptions,
        });
        if (updated) {
          // Update UI with data from server (includes IDs for new options)
          setCurrentQuestion(updated);
        }
      }
    },
    [currentQuestion, update]
  );

  const deleteCell = useCallback(
    async (cellId: string) => {
      if (!currentQuestion?.id) return;

      const cells = (currentQuestion.data?.cells as string[]) || [];
      const cellIndex = parseInt(cellId);

      // Remove cell from data.cells
      const newCells = cells.filter((c) => c !== cellId);

      // Remove placeholder from body
      const placeholder = `{{{${cellId}}}}`;
      const newBody = (currentQuestion.body || "").replace(placeholder, "");

      // Remove option with matching order
      const newOptions = (currentQuestion.options || []).filter(
        (opt) => opt.order !== cellIndex
      );

      // Update order for remaining options
      const reorderedOptions = newOptions.map((opt) => {
        if (opt.order !== undefined && opt.order > cellIndex) {
          return { ...opt, order: opt.order - 1 };
        }
        return opt;
      });

      // Send to server and wait for response
      const updated = await update(currentQuestion.id, {
        options: reorderedOptions,
        body: newBody,
        data: { cells: newCells },
      });
      if (updated) {
        // Update UI with data from server
        setCurrentQuestion(updated);
      }
    },
    [currentQuestion, update]
  );

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

  const cells = (currentQuestion.data?.cells as string[]) || [];

  return (
    <div className="w-full space-y-4">
      {/* Заголовок с кнопкой */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <p className="text-gray-700 font-semibold">Текст задания</p>
          <span
            className="relative inline-flex items-center justify-center w-6 h-6 bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-bold rounded-full cursor-help transition-colors"
            onMouseEnter={() => {
              setShowHint(true);
            }}
            onMouseLeave={() => {
              setShowHint(false);
            }}
          >
            ?
            {showHint && (
              <div className="absolute top-8 left-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-3 text-sm text-gray-600 font-normal">
                При создании контейнеров в тексте появятся метки{" "}
                <code className="bg-gray-100 px-1 rounded">{"{{{id}}}"}</code> —
                это позиции для ответов
              </div>
            )}
          </span>
        </div>
        <button
          onClick={addCell}
          className="flex items-center gap-2 text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors shadow-sm"
        >
          <span>+</span>
          Добавить контейнер
        </button>
      </div>

      {/* Текстовое поле */}
      <textarea
        className="w-full resize-none border-2 border-gray-200 focus:border-blue-400 min-h-24 p-3 rounded-xl outline-none bg-white text-gray-700 transition-colors"
        placeholder="Введите текст задания..."
        value={currentQuestion.body || ""}
        onChange={(e) => {
          updateQuestionBody(e.target.value);
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
      ></textarea>

      {/* Контейнеры */}
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-700">
            Контейнеры ответов
          </h3>
        </div>

        {cells.length === 0 ? (
          <p className="text-gray-400 text-sm italic text-center py-4">
            Нет контейнеров. Нажмите «Добавить контейнер» чтобы создать.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {cells.map((cellId) => {
              const option = (currentQuestion.options || []).find(
                (opt) => opt.order === parseInt(cellId)
              );
              return (
                <div
                  key={cellId}
                  className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-lg text-sm">
                    {cellId}
                  </div>
                  <input
                    type="text"
                    placeholder="Введите правильный ответ..."
                    value={option?.body || ""}
                    className="flex-1 p-2 px-3 border border-gray-200 focus:border-blue-400 rounded-lg text-gray-700 bg-gray-50 focus:bg-white outline-none transition-colors"
                    onChange={(e) => {
                      updateCellAnswer(cellId, e.target.value);
                    }}
                  />
                  <button
                    onClick={() => {
                      deleteCell(cellId);
                    }}
                    className="flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg cursor-pointer transition-colors"
                  >
                    <BiTrash className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
