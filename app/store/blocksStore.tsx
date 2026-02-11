"use client";

import { create } from "zustand";
import { Block, BlockStyle } from "../types/block";
import { Chapter } from "../types/chapter";
import { Widget, WidgetData } from "../types/widget";

type BlocksStore = {
  blocks: Block[];
  chapterId: number | null;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;

  setChapterId: (chapterId: number | null) => void;
  setBlocks: (Blocks: Block[]) => void;
  setAdjacentChapters: (prev: Chapter | null, next: Chapter | null) => void;

  addBlockLocal: (block: Block) => void;
  removeBlockLocal: (blockId: number) => void;
  swapBlocksLocal: (firstId: number, secondId: number) => void;
  updateBlockStyleLocal: (blockId: number, style: BlockStyle) => void;
  updateBlockLayoutLocal: (blockId: number, layoutType: string, newColumnsCount: number) => void;

  addWidgetLocal: (blockId: number, widget: Widget) => void;
  updateWidgetLocal: (widgetId: number, data: WidgetData) => void;
  moveWidgetLocal: (widgetId: number, newRow: number, newColumn: number) => void;
  moveWidgetToBlockLocal: (widgetId: number, fromBlockId: number, toBlockId: number, newRow: number, newColumn: number) => void;
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
  prevChapter: null,
  nextChapter: null,
  setChapterId: (chapterId) => set({ chapterId }),
  setAdjacentChapters: (prev, next) => set({ prevChapter: prev, nextChapter: next }),

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

  updateBlockLayoutLocal: (blockId, layoutType, newColumnsCount) =>
    set((state) => ({
      blocks: state.blocks.map((block) => {
        if (block.id !== blockId) return block;
        const filteredWidgets = block.widgets.filter((w) => w.column < newColumnsCount);
        const { columnWidths, columnColors, ...restStyle } = block.style || {};
        return {
          ...block,
          layout_type: layoutType,
          widgets: filteredWidgets,
          style: restStyle,
        };
      }),
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
    set((state) => {
      let found = false;
      const updatedBlocks = state.blocks.map((block) => ({
        ...block,
        widgets: block.widgets.map((w) => {
          // Если это сам виджет - обновляем его
          if (w.id === widgetId) {
            found = true;
            console.log(`[updateWidgetLocal] Found widget ${widgetId} in block.widgets`);
            return { ...w, data };
          }
          // Если это контейнерный виджет - проверяем его дочерние виджеты
          if (w.children && w.children.length > 0) {
            const hasChild = w.children.some((child) => child.id === widgetId);
            if (hasChild) {
              found = true;
              console.log(`[updateWidgetLocal] Found child widget ${widgetId} in parent widget ${w.id}`);
            }
            return {
              ...w,
              children: w.children.map((child) =>
                child.id === widgetId ? { ...child, data } : child
              ),
            };
          }
          return w;
        }),
      }));

      if (!found) {
        console.warn(`[updateWidgetLocal] Widget ${widgetId} not found in any block!`);
      }

      return { blocks: updatedBlocks };
    }),

  moveWidgetLocal: (widgetId, newRow, newColumn) =>
    set((state) => ({
      blocks: state.blocks.map((block) => ({
        ...block,
        widgets: block.widgets.map((w) =>
          w.id !== widgetId ? w : { ...w, row: newRow, column: newColumn }
        ),
      })),
    })),

  moveWidgetToBlockLocal: (widgetId, fromBlockId, toBlockId, newRow, newColumn) =>
    set((state) => {
      let movedWidget: Widget | null = null;
      const blocks = state.blocks.map((block) => {
        if (block.id === fromBlockId) {
          const widget = block.widgets.find((w) => w.id === widgetId);
          if (widget) movedWidget = { ...widget, row: newRow, column: newColumn };
          return { ...block, widgets: block.widgets.filter((w) => w.id !== widgetId) };
        }
        return block;
      });
      if (!movedWidget) return { blocks };
      return {
        blocks: blocks.map((block) =>
          block.id === toBlockId
            ? { ...block, widgets: [...block.widgets, movedWidget!] }
            : block
        ),
      };
    }),

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

  clearBlocks: () => set({ blocks: [], chapterId: null, prevChapter: null, nextChapter: null }),
}));
