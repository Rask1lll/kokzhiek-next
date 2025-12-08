"use client";

import { create } from "zustand";

export type ChapterBlock = {
  id: string;
  layoutCode: string;
  createdAt: number;
};

type BlocksStore = {
  blocks: ChapterBlock[];
  addBlock: (layoutCode: string) => void;
  clearBlocks: () => void;
};

export const useBlocksStore = create<BlocksStore>((set) => ({
  blocks: [],
  addBlock: (layoutCode) =>
    set((state) => ({
      blocks: [
        ...state.blocks,
        {
          id: crypto.randomUUID(),
          layoutCode,
          createdAt: Date.now(),
        },
      ],
    })),
  clearBlocks: () => set({ blocks: [] }),
}));
