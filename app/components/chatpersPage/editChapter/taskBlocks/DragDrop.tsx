"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { FiImage, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";
import { useTranslations } from "next-intl";

type DragDropProps = {
  widgetId: number;
};

export default function DragDrop({ widgetId }: DragDropProps) {
  const t = useTranslations("taskEditor");
  const { questions, loading, update, uploadImage, removeImage } =
    useQuestions(widgetId);

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
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
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

      const cellIndex = parseInt(cellId);
      // Find option by position (position corresponds to cellId index)
      const existingOption = (currentQuestion.options || []).find(
        (opt) => opt.position === cellIndex
      );

      if (existingOption?.id) {
        // Update existing option by ID - optimistic update
        const newOptions = (currentQuestion.options || []).map((opt) =>
          opt.id === existingOption.id ? { ...opt, body: answer.trim() } : opt
        );

        // Update UI immediately
        setCurrentQuestion((prev) =>
          prev ? { ...prev, options: newOptions } : prev
        );

        // Send to server
        update(currentQuestion.id, { options: newOptions });
      } else {
        // Create new option - wait for server response to get ID
        const newOptions = [
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

      // Find option by position (position corresponds to cellId index)
      const optionToDelete = (currentQuestion.options || []).find(
        (opt) => opt.position === cellIndex
      );

      if (!optionToDelete?.id) return;

      // Remove cell from data.cells
      const newCells = cells.filter((c) => c !== cellId);

      // Remove placeholder from body
      const placeholder = `{{{${cellId}}}}`;
      const newBody = (currentQuestion.body || "").replace(placeholder, "");

      // Remove option by ID
      const newOptions = (currentQuestion.options || []).filter(
        (opt) => opt.id !== optionToDelete.id
      );

      // Update order for remaining options (position is read-only from server)
      const reorderedOptions = newOptions.map((opt) => {
        // Use position to determine which options need order update
        if (opt.position !== undefined && opt.position > cellIndex) {
          return { ...opt, order: opt.position - 1 };
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

  const handleImageUpload = useCallback(
    async (optionId: number | undefined, file: File) => {
      if (optionId === undefined || !currentQuestion?.id) return;

      const imageUrl = await uploadImage(optionId, file);
      if (imageUrl) {
        // Update currentQuestion with image URL from server
        const updatedOptions = (currentQuestion.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, image_url: imageUrl } : opt
        );
        setCurrentQuestion((prev) =>
          prev ? { ...prev, options: updatedOptions } : prev
        );
      }
    },
    [uploadImage, currentQuestion]
  );

  const handleImageDelete = useCallback(
    async (optionId: number | undefined) => {
      if (optionId === undefined || !currentQuestion?.id) return;

      const success = await removeImage(optionId);
      if (success) {
        // Update currentQuestion - remove image_url
        const updatedOptions = (currentQuestion.options || []).map((opt) =>
          opt.id === optionId ? { ...opt, image_url: null } : opt
        );
        setCurrentQuestion((prev) =>
          prev ? { ...prev, options: updatedOptions } : prev
        );
      }
    },
    [removeImage, currentQuestion]
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
      <div className="w-full space-y-4 p-4 text-gray-500">{t("loadError")}</div>
    );
  }

  const cells = (currentQuestion.data?.cells as string[]) || [];

  return (
    <div className="w-full space-y-4">
      {/* Заголовок с кнопкой */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <p className="text-gray-700 font-semibold">{t("taskText")}</p>
          <span
            className="relative inline-flex items-center justify-center w-6 h-6 bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm md:text-base lg:text-lg font-bold rounded-full cursor-help transition-colors"
            onMouseEnter={() => {
              setShowHint(true);
            }}
            onMouseLeave={() => {
              setShowHint(false);
            }}
          >
            ?
            {showHint && (
              <div className="absolute top-8 left-0 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-3 text-base md:text-lg lg:text-xl text-gray-600 font-normal">
                {t("hintContainers", { placeholder: "{{{id}}}" })}
              </div>
            )}
          </span>
        </div>
        <button
          onClick={addCell}
          className="flex items-center gap-2 text-base md:text-lg lg:text-xl bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors shadow-sm"
        >
          <span>+</span>
          {t("addContainer")}
        </button>
      </div>

      {/* Текстовое поле */}
      <textarea
        spellCheck
        className="w-full resize-none border-2 border-gray-200 focus:border-blue-400 min-h-24 p-3 rounded-xl outline-none bg-white text-gray-700 transition-colors"
        placeholder={t("questionPlaceholder")}
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
            {t("answerContainers")}
          </h3>
        </div>

        {cells.length === 0 ? (
          <p className="text-gray-400 text-base md:text-lg lg:text-xl italic text-center py-4">
            {t("noContainers")}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {cells.map((cellId) => {
              const cellIndex = parseInt(cellId);
              // Find option by position (position corresponds to cellId index)
              const option = (currentQuestion.options || []).find(
                (opt) => opt.position === cellIndex
              );
              return (
                <div
                  key={cellId}
                  className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 font-bold rounded-lg text-base md:text-lg lg:text-xl">
                      {cellId}
                    </div>
                    <input
                      spellCheck
                      type="text"
                      placeholder={t("enterCorrectAnswer")}
                      value={option?.body || ""}
                      className="flex-1 p-2 px-3 border border-gray-200 focus:border-blue-400 rounded-lg text-gray-700 bg-gray-50 focus:bg-white outline-none transition-colors"
                      onChange={(e) => {
                        updateCellAnswer(cellId, e.target.value);
                      }}
                    />
                    {/* Image upload button */}
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => {
                        if (el && option?.id) {
                          fileInputRefs.current.set(option.id, el);
                        }
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && option?.id !== undefined) {
                          handleImageUpload(option.id, file);
                        }
                        if (e.target) {
                          e.target.value = "";
                        }
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = option?.id
                          ? fileInputRefs.current.get(option.id)
                          : null;
                        input?.click();
                      }}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded transition-colors"
                      title={t("addImage")}
                    >
                      <FiImage className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        deleteCell(cellId);
                      }}
                      className="flex items-center justify-center w-10 h-10 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg cursor-pointer transition-colors"
                    >
                      <BiTrash className="w-5 h-5" />
                    </button>
                  </div>
                  {/* Image preview */}
                  {option?.image_url && (
                    <div className="relative ml-12 mt-2">
                      <Image
                        src={option.image_url}
                        alt={option.body || ""}
                        width={100}
                        height={100}
                        className="w-50 h-auto"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (option.id !== undefined) {
                            handleImageDelete(option.id);
                          }
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title={t("removeImage")}
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
