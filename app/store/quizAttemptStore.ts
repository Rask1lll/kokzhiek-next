import { create } from "zustand";

export const useQuizAttemptStore = create<QuizAttemptStore>((set) => ({
  quizAttempts: [],
  setQuizAttempts: (quizAttempt: Task) => set({ quizAttempts }),
}));
