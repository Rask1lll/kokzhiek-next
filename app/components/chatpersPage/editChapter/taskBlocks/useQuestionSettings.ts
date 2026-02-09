"use client";

import { useEffect, useState } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";

export function invalidateQuestions(widgetId: number) {
  window.dispatchEvent(
    new CustomEvent("questionsInvalidated", { detail: { widgetId } })
  );
}

export function useQuestionSettings(widgetId: number) {
  const {
    questions,
    loading,
    update,
    uploadQuestionImage,
    removeQuestionImage,
    uploadSign,
    removeSign,
  } = useQuestions(widgetId);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const first = questions[0];
      if (
        !currentQuestion ||
        currentQuestion.id !== first.id ||
        currentQuestion.image_url !== first.image_url ||
        currentQuestion.sign_url !== first.sign_url ||
        JSON.stringify(currentQuestion.data) !== JSON.stringify(first.data) ||
        currentQuestion.points !== first.points
      ) {
        setCurrentQuestion(first);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  return {
    currentQuestion,
    setCurrentQuestion,
    loading,
    update,
    uploadQuestionImage,
    removeQuestionImage,
    uploadSign,
    removeSign,
  };
}
