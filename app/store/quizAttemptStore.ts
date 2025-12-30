import { create } from "zustand";

type QuizAttemptStore = {
  attemptId: number | null;
  widgetId: number | null;
  setAttempt: (attemptId: number, widgetId: number) => void;
  clearAttempt: () => void;
};

export const useQuizAttemptStore = create<QuizAttemptStore>((set) => ({
  attemptId: null,
  widgetId: null,
  setAttempt: (attemptId, widgetId) => set({ attemptId, widgetId }),
  clearAttempt: () => set({ attemptId: null, widgetId: null }),
}));
