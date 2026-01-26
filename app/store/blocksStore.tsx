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

  // Container widget children methods
  addChildWidgetLocal: (parentWidgetId: number, childWidget: Widget) => void;
  removeChildWidgetLocal: (parentWidgetId: number, childWidgetId: number) => void;
  updateChildWidgetLocal: (parentWidgetId: number, childWidgetId: number, data: WidgetData) => void;

  clearBlocks: () => void;
};

function widgetToLocal(w: Widget): Widget {
  return {
    id: w.id,
    type: w.type,
    data: w.data ?? {},
    row: w.row ?? 0,
    column: w.column ?? 0,
    parent_id: w.parent_id,
    children: w.children?.map(widgetToLocal),
  };
}

function BlockToLocal(Block: Block): Block {
  return {
    id: Block.id,
    layout_type: Block.layout_type,
    order: Block.order,
    style: Block.style ?? {},
    widgets: (Block.widgets || []).map(widgetToLocal),
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

  // Add child widget to a container widget
  addChildWidgetLocal: (parentWidgetId, childWidget) =>
    set((state) => ({
      blocks: state.blocks.map((block) => ({
        ...block,
        widgets: block.widgets.map((w) =>
          w.id !== parentWidgetId
            ? w
            : {
                ...w,
                children: [
                  ...(w.children || []),
                  {
                    id: childWidget.id,
                    type: childWidget.type,
                    data: childWidget.data ?? {},
                    row: childWidget.row ?? 0,
                    column: childWidget.column ?? 0,
                    parent_id: parentWidgetId,
                  },
                ],
              }
        ),
      })),
    })),

  // Remove child widget from a container widget
  removeChildWidgetLocal: (parentWidgetId, childWidgetId) =>
    set((state) => ({
      blocks: state.blocks.map((block) => ({
        ...block,
        widgets: block.widgets.map((w) =>
          w.id !== parentWidgetId
            ? w
            : {
                ...w,
                children: (w.children || []).filter((c) => c.id !== childWidgetId),
              }
        ),
      })),
    })),

  // Update child widget data
  updateChildWidgetLocal: (parentWidgetId, childWidgetId, data) =>
    set((state) => ({
      blocks: state.blocks.map((block) => ({
        ...block,
        widgets: block.widgets.map((w) =>
          w.id !== parentWidgetId
            ? w
            : {
                ...w,
                children: (w.children || []).map((c) =>
                  c.id !== childWidgetId ? c : { ...c, data }
                ),
              }
        ),
      })),
    })),

  clearBlocks: () => set({ blocks: [], chapterId: null }),
}));
