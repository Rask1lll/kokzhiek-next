"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { UserData } from "../types/user";

export type PresenceUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
};

type JoinMessage = {
  type: "presence.join";
  bookId: string;
  chapterId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
};

type LeaveMessage = {
  type: "presence.leave";
  bookId: string;
  chapterId: string;
  user: {
    id: string;
  };
};

type BookPresenceMessage = {
  type: "presence.book";
  bookId: string;
};

type PresenceByChapter = Record<string, PresenceUser[]>;

const WS_URL =
  process.env.NODE_ENV === "production"
    ? `wss://${process.env.NEXT_PUBLIC_WS_DOMAIN || window.location.host}/ws`
    : "ws://localhost:8080/ws";

export function useChapterPresence(user: UserData | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const [presenceByChapter, setPresenceByChapter] = useState<PresenceByChapter>({});
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentChapterRef = useRef<{ bookId: string; chapterId: string } | null>(null);

  const connect = useCallback(() => {
    if (!user) {
      console.log("WS connect skipped - no user");
      return;
    }

    // Закрываем предыдущее соединение если есть
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    console.log("WS connecting to:", WS_URL);

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WS connected to:", WS_URL);
        console.log("WS readyState:", ws.readyState);
        setIsConnected(true);
        // Если был выбран chapter до подключения, отправляем join
        if (currentChapterRef.current) {
          const joinMsg: JoinMessage = {
            type: "presence.join",
            bookId: currentChapterRef.current.bookId,
            chapterId: currentChapterRef.current.chapterId,
            user: {
              id: String(user.id),
              name: user.name || "",
              email: user.email,
              avatar: null,
            },
          };
          console.log("WS sending join on connect:", joinMsg);
          ws.send(JSON.stringify(joinMsg));
        }
      };

      ws.onmessage = (event) => {
        console.log("WS raw message:", event.data);
        try {
          const data = JSON.parse(event.data);
          console.log("WS parsed message:", data);

          // pong на ping (поддерживаем оба формата: event и type)
          if (data.event === "ping" || data.type === "ping") {
            console.log("WS sending pong");
            ws.send(JSON.stringify({ event: "pong" }));
            return;
          }

          // Ответ со списком пользователей в главе (presence.chapter)
          if (data.type === "presence.chapter") {
            const chapterId = String(data.chapterId);
            const users: PresenceUser[] = data.users || [];
            console.log("WS presence for chapter:", chapterId, "users:", users);
            setPresenceByChapter((prev) => ({
              ...prev,
              [chapterId]: users,
            }));
          }

          // Кто-то зашёл в главу (presence.join broadcast)
          if (data.type === "presence.joined") {
            const chapterId = String(data.chapterId);
            const newUser: PresenceUser = data.user;
            console.log("WS user joined chapter:", chapterId, newUser);
            setPresenceByChapter((prev) => {
              const existing = prev[chapterId] || [];
              // Не добавляем дубликаты
              if (existing.some((u) => u.id === newUser.id)) {
                return prev;
              }
              return {
                ...prev,
                [chapterId]: [...existing, newUser],
              };
            });
          }

          // Кто-то вышел из главы (presence.leave broadcast)
          if (data.type === "presence.left") {
            const chapterId = String(data.chapterId);
            const userId = data.user?.id;
            console.log("WS user left chapter:", chapterId, userId);
            setPresenceByChapter((prev) => {
              const existing = prev[chapterId] || [];
              return {
                ...prev,
                [chapterId]: existing.filter((u) => u.id !== userId),
              };
            });
          }

          // Ответ со списком пользователей по всем главам книги (presence.book)
          if (data.type === "presence.book") {
            const chapters: Record<string, PresenceUser[]> = data.chapters || {};
            console.log("WS presence for book:", data.bookId, "chapters:", chapters);
            setPresenceByChapter((prev) => ({
              ...prev,
              ...chapters,
            }));
          }
        } catch (err) {
          console.error("Error parsing WS message:", err);
        }
      };

      ws.onclose = (event) => {
        console.log("WS closed:", event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;
        // Переподключение через 5 секунд только если было нормальное соединение
        if (event.code !== 1006) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (err) {
      console.error("Failed to connect WebSocket:", err);
    }
  }, [user]);

  // Подключение при наличии user
  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user, connect]);

  // Обработка закрытия вкладки/перехода - отправляем leave через sendBeacon
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentChapterRef.current && user) {
        const leaveMsg: LeaveMessage = {
          type: "presence.leave",
          bookId: currentChapterRef.current.bookId,
          chapterId: currentChapterRef.current.chapterId,
          user: {
            id: String(user.id),
          },
        };

        // Используем sendBeacon для надёжной отправки при закрытии
        const API_URL = process.env.NEXT_PUBLIC_SERVER_URL || "";
        navigator.sendBeacon(
          `${API_URL}/api/v1/presence/leave`,
          JSON.stringify(leaveMsg)
        );

        // Также пробуем отправить через WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify(leaveMsg));
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user]);

  // Присоединиться к главе
  const joinChapter = useCallback(
    (bookId: string, chapterId: string) => {
      if (!user) return;

      currentChapterRef.current = { bookId, chapterId };

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const joinMsg: JoinMessage = {
          type: "presence.join",
          bookId,
          chapterId,
          user: {
            id: String(user.id),
            name: user.name || "",
            email: user.email,
            avatar: null,
          },
        };
        console.log("WS sending join:", joinMsg);
        wsRef.current.send(JSON.stringify(joinMsg));
      } else {
        console.log("WS not ready for join, state:", wsRef.current?.readyState);
      }
    },
    [user]
  );

  // Покинуть главу
  const leaveChapter = useCallback(
    (bookId: string, chapterId: string) => {
      if (!user) return;

      currentChapterRef.current = null;

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const leaveMsg: LeaveMessage = {
          type: "presence.leave",
          bookId,
          chapterId,
          user: {
            id: String(user.id),
          },
        };
        console.log("WS sending leave:", leaveMsg);
        wsRef.current.send(JSON.stringify(leaveMsg));
      }
    },
    [user]
  );

  // Запросить состояние всех глав книги
  const requestBookPresence = useCallback(
    (bookId: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        const msg: BookPresenceMessage = {
          type: "presence.book",
          bookId,
        };
        console.log("WS requesting book presence:", msg);
        wsRef.current.send(JSON.stringify(msg));
      } else {
        console.log("WS not ready for book presence request, state:", wsRef.current?.readyState);
      }
    },
    []
  );

  // Проверка занятости главы (занята другими пользователями)
  const isChapterOccupied = useCallback(
    (chapterId: string): boolean => {
      const users = presenceByChapter[chapterId] || [];
      // Глава занята, если там есть пользователи (кроме текущего)
      return users.some((u) => u.id !== String(user?.id));
    },
    [presenceByChapter, user]
  );

  // Получить пользователей в главе
  const getChapterUsers = useCallback(
    (chapterId: string): PresenceUser[] => {
      return presenceByChapter[chapterId] || [];
    },
    [presenceByChapter]
  );

  return {
    presenceByChapter,
    isConnected,
    joinChapter,
    leaveChapter,
    requestBookPresence,
    isChapterOccupied,
    getChapterUsers,
  };
}
