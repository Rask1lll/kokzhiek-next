"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";
import { TaskType } from "@/app/types/enums";

type FillBlankProps = {
  widgetId: number;
};

export default function FillBlank({ widgetId }: FillBlankProps) {
  const { questions, loading, error, create, update } = useQuestions(widgetId);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const hasCreatedQuestionRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ensure questions is an array
  const questionsArray = useMemo(
    () => (Array.isArray(questions) ? questions : []),
    [questions]
  );

  // Reset initialization when widgetId changes
  useEffect(() => {
    hasInitializedRef.current = false;
    hasCreatedQuestionRef.current = false;
    setCurrentQuestion(null);
    setIsInitialLoading(true);
  }, [widgetId]);

  // Initialize or create question - single effect to avoid race conditions
  useEffect(() => {
    if (!widgetId) return;

    // If already initialized, don't do anything
    if (hasInitializedRef.current) return;

    // If we have questions, use the first one
    if (questionsArray.length > 0) {
      const firstQuestion = questionsArray[0];
      // Ensure data structure is correct
      const normalizedQuestion = {
        ...firstQuestion,
        data:
          firstQuestion.data &&
          typeof firstQuestion.data === "object" &&
          "blanks" in firstQuestion.data
            ? firstQuestion.data
            : { blanks: [] },
      };
      hasInitializedRef.current = true;
      setIsInitialLoading(false);
      setCurrentQuestion(normalizedQuestion);
      return;
    }

    // If still loading, wait
    if (loading) return;

    // If already creating, wait
    if (isCreating) return;

    // If already tried to create, don't try again
    if (hasCreatedQuestionRef.current) return;

    // Loading is complete, no questions exist, and we haven't created one yet
    // This is the ONLY place where we create a question
    hasCreatedQuestionRef.current = true;
    setIsCreating(true);

    create({
      type: TaskType.FILL_BLANK,
      body: "",
      data: { blanks: [] },
      points: 1,
      options: [],
    })
      .then((newQuestion) => {
        setIsCreating(false);
        if (newQuestion) {
          hasInitializedRef.current = true;
          setIsInitialLoading(false);
          setCurrentQuestion(newQuestion);
        } else {
          // Reset flag if creation failed so we can try again
          setIsInitialLoading(false);
          hasCreatedQuestionRef.current = false;
        }
      })
      .catch((err) => {
        console.error("Error creating question:", err);
        setIsCreating(false);
        setIsInitialLoading(false);
        hasCreatedQuestionRef.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widgetId, questionsArray.length, loading, isCreating]); // Check all conditions

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

      // Update local state immediately
      setCurrentQuestion((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          body,
          // Preserve data structure
          data: prev.data || { blanks: [] },
        };
      });

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce server update (don't update local state from response)
      const questionId = currentQuestion.id;
      const currentData = currentQuestion.data || { blanks: [] };
      debounceTimerRef.current = setTimeout(async () => {
        if (!questionId) return;
        await update(questionId, { body, data: currentData });
      }, 500);
    },
    [currentQuestion, update]
  );

  const insertBlank = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const blanks = (currentQuestion.data?.blanks as string[]) || [];
    const blankId = `blank${blanks.length}`;
    const placeholder = `{{${blankId}}}`;
    const newBody = (currentQuestion.body || "") + placeholder;
    const newBlanks = [...blanks, blankId];

    // Update local state immediately
    setCurrentQuestion((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        body: newBody,
        data: { blanks: newBlanks },
      };
    });

    // Send to server (don't create option yet - will be created when user enters answer)
    await update(currentQuestion.id, {
      body: newBody,
      data: { blanks: newBlanks },
    });
  }, [currentQuestion, update]);

  const updateBlankAnswer = useCallback(
    async (blankId: string, answer: string) => {
      if (!currentQuestion?.id) return;

      // Update local state immediately
      const existingOption = (currentQuestion.options || []).find(
        (opt) => opt.match_id === blankId
      );

      let newOptions;
      if (existingOption) {
        // Update existing option
        newOptions = (currentQuestion.options || []).map((opt) =>
          opt.match_id === blankId ? { ...opt, body: answer } : opt
        );
      } else {
        // Create new option if it doesn't exist (only if answer is not empty)
        if (answer.trim()) {
          newOptions = [
            ...(currentQuestion.options || []),
            {
              body: answer,
              image_url: null,
              is_correct: false,
              match_id: blankId,
              group: null,
              order: currentQuestion.options?.length || 0,
            },
          ];
        } else {
          // Don't create option if answer is empty
          newOptions = currentQuestion.options || [];
        }
      }

      // Update local state immediately
      setCurrentQuestion((prev) => {
        if (!prev) return null;
        return { ...prev, options: newOptions };
      });

      // Send to server (don't update local state from response)
      await update(currentQuestion.id, { options: newOptions });
    },
    [currentQuestion, update]
  );

  const renderPreview = () => {
    if (!currentQuestion?.body) return null;

    const parts = currentQuestion.body.split(/(\{\{[^}]+\}\})/g);
    const options = currentQuestion.options || [];

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const blankId = match[1];
        const option = options.find((opt) => opt.match_id === blankId);
        const answer = option?.body || "";

        return (
          <input
            key={index}
            type="text"
            value={answer}
            onChange={(e) => updateBlankAnswer(blankId, e.target.value)}
            placeholder="ответ"
            className="inline-block mx-1 px-2 py-0.5 w-28 text-center text-sm bg-white border-b-2 border-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Show loading state only during initial load or when creating question
  if (isInitialLoading || isCreating) {
    return (
      <div className="w-full space-y-4 p-4">
        <div className="animate-pulse">Загрузка...</div>
      </div>
    );
  }

  // Show error if there's an error and no question
  if (error && !currentQuestion) {
    return (
      <div className="w-full space-y-4 p-4">
        <div className="text-red-600">Ошибка загрузки вопроса: {error}</div>
      </div>
    );
  }

  // Show error message if no question after loading is complete
  if (!currentQuestion && !isInitialLoading && !isCreating) {
    return (
      <div className="w-full space-y-4 p-4 text-gray-500">
        Ошибка загрузки вопроса
        {error && <div className="text-sm text-red-500 mt-2">{error}</div>}
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Text editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Текст задания:
          </span>
          <Button
            content="+ Вставить пропуск"
            color="blue"
            size="sm"
            onClick={insertBlank}
          />
        </div>

        <textarea
          value={currentQuestion?.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
          placeholder="Введите текст. Нажмите '+ Вставить пропуск' для добавления поля ввода."
          className="w-full min-h-[80px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Preview with inputs */}
      {currentQuestion?.body && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-400 mb-3 block">
            Заполните правильные ответы:
          </span>
          <div className="text-base text-slate-800 leading-loose">
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
}
