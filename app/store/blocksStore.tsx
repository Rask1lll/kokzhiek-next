"use client";

import { create } from "zustand";

export type BlockWidget = {
  id: string;
  type: string;
  content: string;
  order: number;
};

export type ChapterBlock = {
  id: string;
  layoutCode: string;
  createdAt: number;
  order: number;
  widgets: BlockWidget[];
};

type BlocksStore = {
  blocks: ChapterBlock[];
  addBlock: (layoutCode: string) => void;
  swapBlocks: (firstId: string, secondId: string) => void;
  setSlotWidget: (blockId: string, order: number, widgetType: string) => void;
  updateWidgetContent: (
    blockId: string,
    order: number,
    content: string
  ) => void;
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
          order: state.blocks.length,
          widgets: [],
        },
      ],
    })),

  swapBlocks: (firstId, secondId) =>
    set((state) => {
      const blocks = [...state.blocks];
      const firstIndex = blocks.findIndex((b) => b.id === firstId);
      const secondIndex = blocks.findIndex((b) => b.id === secondId);

      if (firstIndex === -1 || secondIndex === -1) {
        return { blocks: state.blocks };
      }

      // swap positions in array
      const tmp = blocks[firstIndex];
      blocks[firstIndex] = blocks[secondIndex];
      blocks[secondIndex] = tmp;

      // recompute order field based on new index
      const updated = blocks.map((b, index) => ({
        ...b,
        order: index,
      }));

      return { blocks: updated };
    }),

  setSlotWidget: (blockId, order, widgetType) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id !== blockId
          ? block
          : {
              ...block,
              widgets: (() => {
                const existing = block.widgets.find((w) => w.order === order);
                if (existing) {
                  return block.widgets.map((w) =>
                    w.order !== order
                      ? w
                      : {
                          ...w,
                          type: widgetType,
                          content: "",
                        }
                  );
                }
                return [
                  ...block.widgets,
                  {
                    id: crypto.randomUUID(),
                    type: widgetType,
                    content: "",
                    order,
                  },
                ];
              })(),
            }
      ),
    })),

  updateWidgetContent: (blockId, order, content) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id !== blockId
          ? block
          : {
              ...block,
              widgets: block.widgets.map((w) =>
                w.order !== order
                  ? w
                  : {
                      ...w,
                      content,
                    }
              ),
            }
      ),
    })),

  clearBlocks: () => set({ blocks: [] }),
}));
