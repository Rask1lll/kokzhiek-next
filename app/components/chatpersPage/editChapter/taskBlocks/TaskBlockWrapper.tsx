"use client";

import { ReactNode, useState, useEffect } from "react";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";

type TaskBlockWrapperProps = {
  widgetId: number;
  children: ReactNode;
};

export default function TaskBlockWrapper({
  widgetId,
  children,
}: TaskBlockWrapperProps) {
  const { questions, loading } = useQuestions(widgetId);

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const firstQuestion = questions[0];
      if (!currentQuestion || currentQuestion.id !== firstQuestion.id) {
        setCurrentQuestion(firstQuestion);
      } else if (
        currentQuestion.image_url !== firstQuestion.image_url ||
        currentQuestion.sign_url !== firstQuestion.sign_url ||
        JSON.stringify(currentQuestion.data) !==
          JSON.stringify(firstQuestion.data)
      ) {
        setCurrentQuestion(firstQuestion);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  if (loading || !currentQuestion) {
    return <>{children}</>;
  }

  const bgColor =
    currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    "bgColor" in currentQuestion.data &&
    typeof currentQuestion.data.bgColor === "string"
      ? currentQuestion.data.bgColor
      : "#ffffff";
  const signUrl = currentQuestion.sign_url || null;
  const conditionalSignMode =
    currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    "conditionalSignMode" in currentQuestion.data &&
    typeof (currentQuestion.data as { conditionalSignMode?: string })
      .conditionalSignMode === "string"
      ? (
          currentQuestion.data as {
            conditionalSignMode?: string;
          }
        ).conditionalSignMode
      : "absolute";

  const signSize =
    currentQuestion.data &&
    typeof currentQuestion.data === "object" &&
    "signSize" in currentQuestion.data &&
    typeof currentQuestion.data.signSize === "string"
      ? (currentQuestion.data.signSize as string)
      : "md";

  const signSizeClass: Record<string, string> = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const signImage = signUrl ? (
    <img
      src={signUrl}
      alt="Условный знак"
      className={`${signSizeClass[signSize] || signSizeClass.md} object-contain flex-shrink-0`}
    />
  ) : null;

  return (
    <div
      className="w-full p-1"
      style={{
        backgroundColor: bgColor,
      }}
    >
      {conditionalSignMode === "absolute" ? (
        <div className="relative">
          {signImage && (
            <div className="absolute -left-10 top-0">
              {signImage}
            </div>
          )}
          <div>{children}</div>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          {signImage}
          <div className="flex-1">{children}</div>
        </div>
      )}
    </div>
  );
}
