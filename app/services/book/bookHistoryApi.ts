import { getAuthHeaders } from "../../libs/auth";
import { ConstructorResponse } from "../../types/constructorResponse";

const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL;

// Типы для истории (временные, будут обновлены после проверки API)
export type HistorySession = {
  id: string;
  created_at: string;
  updated_at?: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  events_count?: number;
  [key: string]: unknown; // Для дополнительных полей, которые может вернуть API
};

export type HistoryEvent = {
  id: string;
  session_id?: string;
  created_at: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  event_type?: string;
  description?: string;
  [key: string]: unknown; // Для дополнительных полей
};

export type RestorePayload = {
  version_id?: string;
  session_id?: string;
  event_id?: string;
  [key: string]: unknown;
};

export type CompareParams = {
  version_id_1?: string;
  version_id_2?: string;
  session_id_1?: string;
  session_id_2?: string;
  [key: string]: unknown;
};

// GET /books/{id}/history/sessions - список сессий
export async function getBookHistorySessions(
  bookId: string | number
): Promise<ConstructorResponse<HistorySession[]> | undefined> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/history/sessions`,
      {
        headers: getAuthHeaders(),
        method: "GET",
      }
    );

    if (!res.ok) {
      console.error("getBookHistorySessions failed:", res.status);
      return undefined;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching book history sessions:", error);
    return undefined;
  }
}

// GET /books/{id}/history/sessions/{sessionId} - события сессии
export async function getBookHistorySession(
  bookId: string | number,
  sessionId: string | number
): Promise<ConstructorResponse<HistoryEvent[]> | undefined> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/history/sessions/${sessionId}`,
      {
        headers: getAuthHeaders(),
        method: "GET",
      }
    );

    if (!res.ok) {
      console.error("getBookHistorySession failed:", res.status);
      return undefined;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching book history session:", error);
    return undefined;
  }
}

// GET /books/{id}/history/events - все события
export async function getBookHistoryEvents(
  bookId: string | number
): Promise<ConstructorResponse<HistoryEvent[]> | undefined> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/history/events`,
      {
        headers: getAuthHeaders(),
        method: "GET",
      }
    );

    if (!res.ok) {
      console.error("getBookHistoryEvents failed:", res.status);
      return undefined;
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching book history events:", error);
    return undefined;
  }
}

// POST /books/{id}/history/restore - восстановить до версии
export async function restoreBookHistory(
  bookId: string | number,
  payload: RestorePayload
): Promise<ConstructorResponse<unknown> | undefined> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/history/restore`,
      {
        headers: getAuthHeaders(),
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("restoreBookHistory failed:", res.status, errorText);
      return undefined;
    }

    return res.json();
  } catch (error) {
    console.error("Error restoring book history:", error);
    return undefined;
  }
}

// POST /books/{id}/history/restore/session/{sessionId} - восстановить до сессии
export async function restoreBookHistorySession(
  bookId: string | number,
  sessionId: string | number
): Promise<ConstructorResponse<unknown> | undefined> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/books/${bookId}/history/restore/session/${sessionId}`,
      {
        headers: getAuthHeaders(),
        method: "POST",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("restoreBookHistorySession failed:", res.status, errorText);
      return undefined;
    }

    return res.json();
  } catch (error) {
    console.error("Error restoring book history session:", error);
    return undefined;
  }
}

// GET /books/{id}/history/compare - сравнить версии
export async function compareBookHistory(
  bookId: string | number,
  params: CompareParams
): Promise<ConstructorResponse<unknown> | undefined> {
  try {
    const url = new URL(`${API_BASE}/api/v1/books/${bookId}/history/compare`);

    // Добавляем параметры запроса
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const res = await fetch(url.toString(), {
      headers: getAuthHeaders(),
      method: "GET",
    });

    if (!res.ok) {
      console.error("compareBookHistory failed:", res.status);
      return undefined;
    }

    return res.json();
  } catch (error) {
    console.error("Error comparing book history:", error);
    return undefined;
  }
}
