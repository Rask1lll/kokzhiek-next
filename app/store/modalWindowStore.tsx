import { create } from "zustand";
import { ModalWindowType } from "../types/modalWindow";

export const useModalWindowStore = create<ModalWindowType>((set) => ({
  content: null,
  addContent: (newContent) => set({ content: newContent }),
  removeContent: () => set({ content: null }),
}));
