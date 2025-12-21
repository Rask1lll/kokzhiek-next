"use client";

import { create } from "zustand";
import { Block, BlockStyle } from "../types/block";
import { Widget, WidgetData } from "../types/widget";

type BlocksStore = {
  blocks: Block[];
  chapterId: number | null;

  setChapterId: (chapterId: number | null) => void;
  setBlocks: (Blocks: Block[]) => void;

  addBlockLocal: (block: Block) => void;
  removeBlockLocal: (blockId: number) => void;
  swapBlocksLocal: (firstId: number, secondId: number) => void;
  updateBlockStyleLocal: (blockId: number, style: BlockStyle) => void;

  addWidgetLocal: (blockId: number, widget: Widget) => void;
  updateWidgetLocal: (widgetId: number, data: WidgetData) => void;
  removeWidgetLocal: (blockId: number, widgetId: number) => void;

  clearBlocks: () => void;
};

function BlockToLocal(Block: Block): Block {
  return {
    id: Block.id,
    layout_type: Block.layout_type,
    order: Block.order,
    style: Block.style ?? {},
    widgets: (Block.widgets || []).map((w) => ({
      id: w.id,
      type: w.type,
      data: w.data ?? {},
      row: w.row ?? 0,
      column: w.column ?? 0,
    })),
  };
}

export const useBlocksStore = create<BlocksStore>((set) => ({
  blocks: [],
  chapterId: null,
  setChapterId: (chapterId) => set({ chapterId }),

  setBlocks: (Blocks) =>
    set({
      blocks: Blocks.map(BlockToLocal).sort((a, b) => a.order - b.order),
    }),

  addBlockLocal: (Block) =>
    set((state) => ({
      blocks: [...state.blocks, BlockToLocal(Block)].sort(
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

      const firstOrder = blocks[firstIndex].order;
      const secondOrder = blocks[secondIndex].order;

      blocks[firstIndex] = { ...blocks[firstIndex], order: secondOrder };
      blocks[secondIndex] = { ...blocks[secondIndex], order: firstOrder };

      return { blocks: blocks.sort((a, b) => a.order - b.order) };
    }),

  updateBlockStyleLocal: (blockId, style) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id !== blockId
          ? block
          : { ...block, style: { ...block.style, ...style } }
      ),
    })),

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
                    row: widget.row ?? 0,
                    column: widget.column ?? 0,
                  },
                ],
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

  clearBlocks: () => set({ blocks: [], chapterId: null }),
}));
