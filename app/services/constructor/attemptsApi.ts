import { ConstructorResponse } from "@/app/types/constructorResponse";
import { getAuthHeaders } from "@/app/libs/auth";
import { API_BASE } from "./constructorApi";

export type Attempt = {
  id: number;
  attempt_number: number;
  status: "in_progress" | "completed";
  started_at: string;
  finished_at?: string;
  score?: number;
  max_score?: number;
};

export type StartAttemptResponse = {
  id: number;
  attempt_number: number;
  status: "in_progress";
  started_at: string;
};

export type AnswerResponse = {
  is_correct: boolean;
  points_earned: number;
};

export type CompleteAttemptResponse = Attempt;

// Start a new attempt
export async function startAttempt(
  widgetId: number
): Promise<ConstructorResponse<StartAttemptResponse> | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/widgets/${widgetId}/attempts/start`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("startAttempt failed:", res.status, data);
      return data; // Возвращаем ответ с ошибкой, чтобы получить messages
    }

    return data;
  } catch (error) {
    console.error("startAttempt error:", error);
    return {
      success: false,
      data: null as unknown as StartAttemptResponse,
      messages: ["Ошибка сети или сервера"],
    };
  }
}

// Submit an answer
export async function submitAnswer(
  attemptId: number,
  questionId: number,
  answerData: Record<string, unknown>
): Promise<ConstructorResponse<AnswerResponse> | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/attempts/${attemptId}/answer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question_id: questionId,
        data: answerData,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("submitAnswer failed:", res.status, data);
      return data; // Возвращаем ответ с ошибкой, чтобы получить messages
    }

    return data;
  } catch (error) {
    console.error("submitAnswer error:", error);
    return {
      success: false,
      data: null as unknown as AnswerResponse,
      messages: ["Ошибка сети или сервера"],
    };
  }
}

// Complete an attempt
export async function completeAttempt(
  attemptId: number
): Promise<ConstructorResponse<CompleteAttemptResponse> | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/attempts/${attemptId}/complete`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("completeAttempt failed:", res.status, data);
      return data; // Возвращаем ответ с ошибкой, чтобы получить messages
    }

    return data;
  } catch (error) {
    console.error("completeAttempt error:", error);
    return {
      success: false,
      data: null as unknown as CompleteAttemptResponse,
      messages: ["Ошибка сети или сервера"],
    };
  }
}
