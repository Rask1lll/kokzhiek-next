"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useQuestions } from "@/app/hooks/useQuestions";
import { useAttempt } from "@/app/hooks/useAttempt";
import TaskViewWrapper from "./TaskViewWrapper";
import { getNegativeFeedback, getPositiveFeedback } from "@/app/libs/feedback";

type SentenceOrderViewProps = {
  widgetId: number;
};

// Fisher-Yates shuffle with seed
function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function SentenceOrderView({ widgetId }: SentenceOrderViewProps) {
  const { questions } = useQuestions(widgetId);
  const { loading, error, submit } = useAttempt(widgetId);
  const [shuffleSeed] = useState(() => Math.random());
  const [result, setResult] = useState<{
    is_correct: boolean;
    points_earned: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<"available" | "sentence" | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const questionsArray = questions;
  const currentQuestion = questionsArray.length > 0 ? questionsArray[0] : null;
  const options = currentQuestion?.options || [];

  // Get all option IDs sorted by order (correct order)
  const allOptionIds = options
    .filter((opt) => opt.id !== undefined)
    .map((opt) => opt.id!)
    .sort(
      (a, b) =>
        (options.find((o) => o.id === a)?.order || 0) -
        (options.find((o) => o.id === b)?.order || 0)
    );

  // Shuffled available words (not yet placed in sentence)
  const [availableWords, setAvailableWords] = useState<number[]>(() => {
    return shuffleArrayWithSeed([...allOptionIds], shuffleSeed);
  });

  // Words placed in sentence area (in order)
  const [sentenceWords, setSentenceWords] = useState<number[]>([]);

  // Update when options change
  useEffect(() => {
    if (options.length > 0 && availableWords.length === 0 && sentenceWords.length === 0) {
      const optionIds = options
        .filter((opt) => opt.id !== undefined)
        .map((opt) => opt.id!)
        .sort(
          (a, b) =>
            (options.find((o) => o.id === a)?.order || 0) -
            (options.find((o) => o.id === b)?.order || 0)
        );
      if (optionIds.length > 0) {
        setAvailableWords(shuffleArrayWithSeed([...optionIds], shuffleSeed));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length, shuffleSeed]);

  const getOptionById = (id: number) => {
    return options.find((opt) => opt.id === id);
  };

  const handleDragStart = (optionId: number, from: "available" | "sentence") => {
    setDraggedId(optionId);
    setDraggedFrom(from);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDraggedFrom(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index?: number) => {
    e.preventDefault();
    if (index !== undefined) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    if (draggedId === null || draggedFrom === null) return;

    if (draggedFrom === "available") {
      // Moving from available to sentence
      setAvailableWords((prev) => prev.filter((id) => id !== draggedId));
      if (targetIndex !== undefined) {
        // Insert at specific position
        setSentenceWords((prev) => {
          const newSentence = [...prev];
          newSentence.splice(targetIndex, 0, draggedId);
          return newSentence;
        });
      } else {
        // Add to end
        setSentenceWords((prev) => [...prev, draggedId]);
      }
    } else if (draggedFrom === "sentence") {
      // Moving within sentence or back to available
      const sourceIndex = sentenceWords.indexOf(draggedId);
      if (sourceIndex === -1) return;

      if (targetIndex !== undefined && targetIndex !== sourceIndex) {
        // Reordering within sentence
        setSentenceWords((prev) => {
          const newSentence = [...prev];
          newSentence.splice(sourceIndex, 1);
          const insertIndex = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
          newSentence.splice(insertIndex, 0, draggedId);
          return newSentence;
        });
      } else {
        // Moving back to available
        setSentenceWords((prev) => prev.filter((id) => id !== draggedId));
        setAvailableWords((prev) => [...prev, draggedId]);
      }
    }

    setResult(null);
    handleDragEnd();
  };

  const handleWordClick = (optionId: number, from: "available" | "sentence") => {
    if (from === "available") {
      // Move from available to sentence
      setAvailableWords((prev) => prev.filter((id) => id !== optionId));
      setSentenceWords((prev) => [...prev, optionId]);
    } else {
      // Move from sentence back to available
      setSentenceWords((prev) => prev.filter((id) => id !== optionId));
      setAvailableWords((prev) => [...prev, optionId]);
    }
    setResult(null);
  };

  const renderWord = (
    optionId: number,
    isDragging: boolean,
    isDragOver: boolean = false
  ) => {
    const option = getOptionById(optionId);
    if (!option) return null;

    return (
      <div
        draggable
        onDragStart={() => handleDragStart(optionId, sentenceWords.includes(optionId) ? "sentence" : "available")}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => handleWordClick(optionId, sentenceWords.includes(optionId) ? "sentence" : "available")}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg cursor-move select-none
          transition-all duration-200
          ${isDragging ? "opacity-50 scale-95" : ""}
          ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2" : ""}
          ${
            sentenceWords.includes(optionId)
              ? "bg-blue-100 border-2 border-blue-400 text-blue-800 hover:bg-blue-200"
              : "bg-white border-2 border-slate-300 text-gray-800 hover:border-blue-500 hover:bg-blue-50"
          }
        `}
      >
        {option.image_url && (
          <div className="relative w-16 h-16 shrink-0">
            <Image
              src={option.image_url}
              alt={option.body || ""}
              fill
              className="object-cover rounded"
              unoptimized
            />
          </div>
        )}
        <span className="text-base md:text-lg font-medium">
          {option.body || "Пусто"}
        </span>
      </div>
    );
  };

  if (!currentQuestion || options.length === 0) {
    return null;
  }

  return (
    <TaskViewWrapper widgetId={widgetId}>
      <div className="w-full space-y-6">
        {/* Question body */}
        {currentQuestion.body && (
          <div className="mb-4">
            <p className="text-base md:text-lg lg:text-xl text-slate-700 font-medium">
              {currentQuestion.body}
            </p>
          </div>
        )}

        {/* Sentence area - where words are placed */}
        <div className="min-h-[80px] p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          {/* <p className="text-sm text-gray-500 mb-3">Составьте предложение:</p> */}
          <div
            className="flex flex-wrap gap-2 min-h-[60px] items-center"
            onDragOver={(e) => handleDragOver(e)}
            onDrop={(e) => handleDrop(e)}
          >
            {sentenceWords.length === 0 ? (
              // <span className="text-gray-400 italic">Перетащите слова сюда</span>
              <span className="text-gray-400 italic"></span>
            ) : (
              sentenceWords.map((optionId, index) => (
                <div
                  key={optionId}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  {renderWord(
                    optionId,
                    draggedId === optionId,
                    dragOverIndex === index
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available words area */}
        <div>
          {/* <p className="text-sm text-gray-500 mb-3">Доступные слова:</p> */}
          <div className="flex flex-wrap gap-2">
            {availableWords.map((optionId) =>
              renderWord(
                optionId,
                draggedId === optionId,
                false
              )
            )}
          </div>
        </div>

        {/* Result feedback */}
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

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={async () => {
              if (sentenceWords.length === 0 || !currentQuestion?.id) {
                return;
              }

              setSubmitting(true);
              // Преобразуем массив id в массив строк
              const order = sentenceWords.map((id) => id.toString());
              const answer = { order };

              const response = await submit(currentQuestion.id, answer);

              if (response) {
                setResult(response);
              }

              setSubmitting(false);
            }}
            disabled={sentenceWords.length === 0 || submitting || loading}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {submitting || loading ? "Отправка..." : "Проверить ответ"}
          </button>
        </div>
      </div>
    </TaskViewWrapper>
  );
}
