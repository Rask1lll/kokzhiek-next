import { useCallback } from "react";
import {
  getBookHistorySessions,
  getBookHistorySession,
  getBookHistoryEvents,
  restoreBookHistory,
  restoreBookHistorySession,
  compareBookHistory,
  type HistorySession,
  type HistoryEvent,
  type RestorePayload,
  type CompareParams,
} from "../services/book/bookHistoryApi";
import { ConstructorResponse } from "../types/constructorResponse";

export function useBookHistory() {
  // GET /books/{id}/history/sessions - список сессий
  const getSessions = useCallback(
    async (
      bookId: string | number
    ): Promise<ConstructorResponse<HistorySession[]> | undefined> => {
      return await getBookHistorySessions(bookId);
    },
    []
  );

  // GET /books/{id}/history/sessions/{sessionId} - события сессии
  const getSession = useCallback(
    async (
      bookId: string | number,
      sessionId: string | number
    ): Promise<ConstructorResponse<HistoryEvent[]> | undefined> => {
      return await getBookHistorySession(bookId, sessionId);
    },
    []
  );

  // GET /books/{id}/history/events - все события
  const getEvents = useCallback(
    async (
      bookId: string | number
    ): Promise<ConstructorResponse<HistoryEvent[]> | undefined> => {
      return await getBookHistoryEvents(bookId);
    },
    []
  );

  // POST /books/{id}/history/restore - восстановить до версии
  const restore = useCallback(
    async (
      bookId: string | number,
      payload: RestorePayload
    ): Promise<ConstructorResponse<unknown> | undefined> => {
      return await restoreBookHistory(bookId, payload);
    },
    []
  );

  // POST /books/{id}/history/restore/session/{sessionId} - восстановить до сессии
  const restoreSession = useCallback(
    async (
      bookId: string | number,
      sessionId: string | number
    ): Promise<ConstructorResponse<unknown> | undefined> => {
      return await restoreBookHistorySession(bookId, sessionId);
    },
    []
  );

  // GET /books/{id}/history/compare - сравнить версии
  const compare = useCallback(
    async (
      bookId: string | number,
      params: CompareParams
    ): Promise<ConstructorResponse<unknown> | undefined> => {
      return await compareBookHistory(bookId, params);
    },
    []
  );

  return {
    getSessions,
    getSession,
    getEvents,
    restore,
    restoreSession,
    compare,
  };
}




