"use client";

import { useCallback, useEffect, useRef } from "react";
import { useBlocksStore } from "@/app/store/blocksStore";
import { WidgetData } from "../types/widget";
import { getChapterState } from "../services/constructor/constructorApi";
import {
  createBlock,
  deleteBlock,
  updateBlocksOrder,
} from "../services/constructor/blocksApi";
import {
  createWidget,
  deleteWidget,
  updateWidget,
} from "../services/constructor/widgetApi";

type UseConstructorOptions = {
  bookId: string | null;
  chapterId: string | null;
};

export function useConstructor({ bookId, chapterId }: UseConstructorOptions) {
  const {
    blocks,
    isLoading,
    error,
    setBlocks,
    setChapterId,
    setLoading,
    setError,
    addBlockLocal,
    removeBlockLocal,
    swapBlocksLocal,
    addWidgetLocal,
    updateWidgetLocal,
    removeWidgetLocal,
    clearBlocks,
  } = useBlocksStore();

  // Debounce timer for widget updates
  const debounceTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  // Fetch constructor state
  const fetchConstructorState = useCallback(async () => {
    if (!bookId || !chapterId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getChapterState(bookId, chapterId);

      if (response.success) {
        setChapterId(response.data.current_chapter.id);
        setBlocks(response.data.blocks);
      } else {
        setError(
          response.messages?.join(", ") || "Failed to fetch constructor state"
        );
      }
    } catch (err) {
      console.error("Error fetching constructor state:", err);
      setError("Ошибка загрузки данных конструктора");
    } finally {
      setLoading(false);
    }
  }, [bookId, chapterId, setBlocks, setChapterId, setLoading, setError]);

  // Create block
  const handleCreateBlock = useCallback(
    async (frontendLayoutCode: string) => {
      const storeChapterId = useBlocksStore.getState().chapterId;
      if (!storeChapterId) {
        console.error("No chapter ID set");
        return;
      }

      try {
        // Send layout code directly - backend accepts any string
        const response = await createBlock(storeChapterId, frontendLayoutCode);

        if (response.success) {
          // Add block with empty widgets array
          addBlockLocal({
            ...response.data,
            widgets: response.data.widgets || [],
          });
        } else {
          console.error("Failed to create block:", response.messages);
        }
      } catch (err) {
        console.error("Error creating block:", err);
      }
    },
    [addBlockLocal]
  );

  // Delete block
  const handleDeleteBlock = useCallback(
    async (blockId: number) => {
      try {
        await deleteBlock(blockId);
        removeBlockLocal(blockId);
      } catch (err) {
        console.error("Error deleting block:", err);
      }
    },
    [removeBlockLocal]
  );

  // Swap/reorder blocks
  const handleSwapBlocks = useCallback(
    async (firstId: number, secondId: number) => {
      const storeChapterId = useBlocksStore.getState().chapterId;
      if (!storeChapterId) return;

      // Optimistic update
      swapBlocksLocal(firstId, secondId);

      try {
        // Get new order from store after swap
        const currentBlocks = useBlocksStore.getState().blocks;
        const blocksOrder = currentBlocks.map((b) => ({
          id: b.id,
          order: b.order,
        }));

        await updateBlocksOrder(storeChapterId, blocksOrder);
      } catch (err) {
        console.error("Error swapping blocks:", err);
        // Revert on error
        swapBlocksLocal(secondId, firstId);
      }
    },
    [swapBlocksLocal]
  );

  // Create widget
  const handleCreateWidget = useCallback(
    async (
      blockId: number,
      widgetType: string,
      initialData: WidgetData = {}
    ) => {
      try {
        const response = await createWidget(blockId, widgetType, initialData);

        if (response.success) {
          addWidgetLocal(blockId, response.data);
          return response.data;
        } else {
          console.error("Failed to create widget:", response.messages);
          return null;
        }
      } catch (err) {
        console.error("Error creating widget:", err);
        return null;
      }
    },
    [addWidgetLocal]
  );

  // Update widget with debounce
  const handleUpdateWidget = useCallback(
    (widgetId: number, data: WidgetData) => {
      // Optimistic local update
      updateWidgetLocal(widgetId, data);

      // Clear existing timer for this widget
      const existingTimer = debounceTimers.current.get(widgetId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounced API call
      const timer = setTimeout(async () => {
        try {
          await updateWidget(widgetId, data);
          debounceTimers.current.delete(widgetId);
        } catch (err) {
          console.error("Error updating widget:", err);
        }
      }, 500);

      debounceTimers.current.set(widgetId, timer);
    },
    [updateWidgetLocal]
  );

  // Delete widget
  const handleDeleteWidget = useCallback(
    async (blockId: number, widgetId: number) => {
      try {
        await deleteWidget(widgetId);
        removeWidgetLocal(blockId, widgetId);
      } catch (err) {
        console.error("Error deleting widget:", err);
      }
    },
    [removeWidgetLocal]
  );

  // Fetch data on mount or when IDs change
  useEffect(() => {
    if (bookId && chapterId) {
      fetchConstructorState();
    }

    // Copy ref value to local variable for cleanup
    const timers = debounceTimers.current;

    return () => {
      // Clear all debounce timers on unmount
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, [bookId, chapterId, fetchConstructorState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearBlocks();
    };
  }, [clearBlocks]);

  return {
    blocks,
    isLoading,
    error,
    refetch: fetchConstructorState,
    createBlock: handleCreateBlock,
    deleteBlock: handleDeleteBlock,
    swapBlocks: handleSwapBlocks,
    createWidget: handleCreateWidget,
    updateWidget: handleUpdateWidget,
    deleteWidget: handleDeleteWidget,
  };
}
