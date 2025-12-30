import { useCallback, useState, useEffect } from "react";
import {
  startAttempt,
  submitAnswer,
  completeAttempt,
  AnswerResponse,
  CompleteAttemptResponse,
} from "@/app/services/constructor/attemptsApi";
import { useQuizAttemptStore } from "@/app/store/quizAttemptStore";

export function useAttempt(widgetId: number) {
  const { attemptId, widgetId: storeWidgetId, setAttempt, clearAttempt } = useQuizAttemptStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Очищаем попытку, если widgetId не совпадает
  useEffect(() => {
    if (attemptId && storeWidgetId !== widgetId) {
      clearAttempt();
    }
  }, [widgetId, storeWidgetId, attemptId]); // Убрали clearAttempt из зависимостей

  const start = useCallback(async () => {
    if (!widgetId) return false;

    // Если есть попытка для другого widget, очищаем её
    if (attemptId && storeWidgetId !== widgetId) {
      clearAttempt();
    }

    setLoading(true);
    setError(null);

    const response = await startAttempt(widgetId);
    if (response?.success && response.data) {
      setAttempt(response.data.id, widgetId);
      setLoading(false);
      return true;
    }

    const errorMessage = response?.messages?.[0] || "Не удалось начать попытку";
    setError(errorMessage);
    setLoading(false);
    return false;
  }, [widgetId, attemptId, storeWidgetId, setAttempt, clearAttempt]);

  const submit = useCallback(
    async (
      questionId: number,
      answerData: Record<string, unknown>
    ): Promise<AnswerResponse | null> => {
      setLoading(true);
      setError(null);

      // Если нет attemptId или он не соответствует текущему widgetId, начинаем новую попытку
      let currentAttemptId = attemptId;
      if (!currentAttemptId || storeWidgetId !== widgetId) {
        // Очищаем старую попытку, если она была для другого widget
        if (currentAttemptId && storeWidgetId !== widgetId) {
          clearAttempt();
        }

        // Начинаем новую попытку
        const startResponse = await startAttempt(widgetId);
        if (!startResponse?.success || !startResponse.data) {
          const errorMessage = startResponse?.messages?.[0] || "Не удалось начать попытку";
          setError(errorMessage);
          setLoading(false);
          return null;
        }

        currentAttemptId = startResponse.data.id;
        setAttempt(currentAttemptId, widgetId);
      }

      // Отправляем ответ
      const response = await submitAnswer(currentAttemptId, questionId, answerData);
      if (response?.success && response.data) {
        setLoading(false);
        return response.data;
      }

      const errorMessage = response?.messages?.[0] || "Не удалось отправить ответ";
      setError(errorMessage);
      setLoading(false);
      return null;
    },
    [attemptId, widgetId, storeWidgetId, setAttempt, clearAttempt]
  );

  const complete = useCallback(async (): Promise<CompleteAttemptResponse | null> => {
    if (!attemptId) {
      setError("Попытка не начата");
      return null;
    }

    // Проверяем, что attemptId соответствует текущему widgetId
    if (storeWidgetId !== widgetId) {
      setError("Попытка не соответствует текущему виджету");
      return null;
    }

    setLoading(true);
    setError(null);

    const response = await completeAttempt(attemptId);
    if (response?.success && response.data) {
      setLoading(false);
      clearAttempt();
      return response.data;
    }

    const errorMessage = response?.messages?.[0] || "Не удалось завершить попытку";
    setError(errorMessage);
    setLoading(false);
    return null;
  }, [attemptId, widgetId, storeWidgetId, clearAttempt]);

  return {
    attemptId,
    loading,
    error,
    start,
    submit,
    complete,
  };
}

