"use client";

import { create } from "zustand";
import {
  ApiBlock,
  ApiWidget,
  ApiWidgetData,
  reverseLayoutTypeMap,
} from "@/app/services/constructorApi";

export type BlockWidget = {
  id: number;
  type: string;
  data: ApiWidgetData;
  order: number;
};

export type ChapterBlock = {
  id: number;
  layoutCode: string;
  order: number;
  widgets: BlockWidget[];
};

type BlocksStore = {
  blocks: ChapterBlock[];
  chapterId: number | null;
  isLoading: boolean;
  error: string | null;

  // State setters
  setChapterId: (chapterId: number | null) => void;
  setBlocks: (apiBlocks: ApiBlock[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Local mutations (will be synced to API by components)
  addBlockLocal: (block: ApiBlock) => void;
  removeBlockLocal: (blockId: number) => void;
  swapBlocksLocal: (firstId: number, secondId: number) => void;
  updateBlockOrdersLocal: (
    blocksOrder: { id: number; order: number }[]
  ) => void;

  // Widget operations
  addWidgetLocal: (blockId: number, widget: ApiWidget) => void;
  updateWidgetLocal: (widgetId: number, data: ApiWidgetData) => void;
  removeWidgetLocal: (blockId: number, widgetId: number) => void;

  clearBlocks: () => void;
};

// Convert API block to local format
function apiBlockToLocal(apiBlock: ApiBlock): ChapterBlock {
  return {
    id: apiBlock.id,
    layoutCode:
      reverseLayoutTypeMap[apiBlock.layout_type] || apiBlock.layout_type,
    order: apiBlock.order,
    widgets: apiBlock.widgets.map((w) => ({
      id: w.id,
      type: w.type,
      data: w.data,
      order: w.order,
    })),
  };
}

export const useBlocksStore = create<BlocksStore>((set) => ({
  blocks: [],
  chapterId: null,
  isLoading: false,
  error: null,

  setChapterId: (chapterId) => set({ chapterId }),

  setBlocks: (apiBlocks) =>
    set({
      blocks: apiBlocks.map(apiBlockToLocal).sort((a, b) => a.order - b.order),
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  addBlockLocal: (apiBlock) =>
    set((state) => ({
      blocks: [...state.blocks, apiBlockToLocal(apiBlock)].sort(
        (a, b) => a.order - b.order
      ),
    })),

  removeBlockLocal: (blockId) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== blockId),
    })),

  swapBlocksLocal: (firstId, secondId) =>
    set((state) => {
      const blocks = [...state.blocks];
      const firstIndex = blocks.findIndex((b) => b.id === firstId);
      const secondIndex = blocks.findIndex((b) => b.id === secondId);

      if (firstIndex === -1 || secondIndex === -1) {
        return { blocks: state.blocks };
      }

      // Swap order values
      const firstOrder = blocks[firstIndex].order;
      const secondOrder = blocks[secondIndex].order;

      blocks[firstIndex] = { ...blocks[firstIndex], order: secondOrder };
      blocks[secondIndex] = { ...blocks[secondIndex], order: firstOrder };

      return { blocks: blocks.sort((a, b) => a.order - b.order) };
    }),

  updateBlockOrdersLocal: (blocksOrder) =>
    set((state) => {
      const orderMap = new Map(blocksOrder.map((b) => [b.id, b.order]));
      const updatedBlocks = state.blocks.map((block) => ({
        ...block,
        order: orderMap.get(block.id) ?? block.order,
      }));
      return { blocks: updatedBlocks.sort((a, b) => a.order - b.order) };
    }),

  addWidgetLocal: (blockId, widget) =>
    set((state) => {
      console.log("addWidgetLocal called:", { blockId, widget });
      return {
        blocks: state.blocks.map((block) =>
          block.id !== blockId
            ? block
            : {
                ...block,
                widgets: [
                  ...block.widgets,
                  {
                    id: widget.id,
                    type: widget.type,
                    data: widget.data ?? {},
                    order: widget.order,
                  },
                ].sort((a, b) => a.order - b.order),
              }
        ),
      };
    }),

  updateWidgetLocal: (widgetId, data) =>
    set((state) => ({
      blocks: state.blocks.map((block) => ({
        ...block,
        widgets: block.widgets.map((w) =>
          w.id !== widgetId ? w : { ...w, data }
        ),
      })),
    })),

  removeWidgetLocal: (blockId, widgetId) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id !== blockId
          ? block
          : {
              ...block,
              widgets: block.widgets.filter((w) => w.id !== widgetId),
            }
      ),
    })),

  clearBlocks: () => set({ blocks: [], chapterId: null, error: null }),
}));
