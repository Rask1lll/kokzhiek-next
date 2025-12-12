"use client";

import { useCallback, useRef, useEffect, useState } from "react";
import { useBlocksStore } from "@/app/store/blocksStore";
import { Widget, WidgetData } from "@/app/types/widget";
import {
  createWidget,
  updateWidget,
  updateWidgetWithFile,
  deleteWidget,
} from "@/app/services/constructor/widgetApi";

type UseWidgetsOptions = {
  debounceMs?: number;
};

export function useWidgets(options: UseWidgetsOptions = {}) {
  const { debounceMs = 500 } = options;

  const { addWidgetLocal, updateWidgetLocal, removeWidgetLocal } =
    useBlocksStore();

  const debounceTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    const timers = debounceTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const create = useCallback(
    async (
      blockId: number,
      type: string,
      data: WidgetData = {},
      row: number = 0,
      column: number = 0
    ) => {
      try {
        const response = await createWidget(blockId, type, data, row, column);

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

  // Update widget (debounced API call, instant local update)
  const update = useCallback(
    (widgetId: number, data: WidgetData) => {
      // Instant local update
      updateWidgetLocal(widgetId, data);

      // Clear existing timer
      const existingTimer = debounceTimers.current.get(widgetId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Debounced API call
      const timer = setTimeout(async () => {
        try {
          await updateWidget(widgetId, data);
          debounceTimers.current.delete(widgetId);
        } catch (err) {
          console.error("Error updating widget:", err);
        }
      }, debounceMs);

      debounceTimers.current.set(widgetId, timer);
    },
    [updateWidgetLocal, debounceMs]
  );

  // Upload file for widget
  const uploadFile = useCallback(
    async (widgetId: number, file: File) => {
      try {
        const response = await updateWidgetWithFile(widgetId, file);

        if (response.success && response.data) {
          updateWidgetLocal(widgetId, response.data.data ?? {});
          return response.data;
        } else {
          console.error("Failed to upload file:", response.messages);
          return null;
        }
      } catch (err) {
        console.error("Error uploading file:", err);
        return null;
      }
    },
    [updateWidgetLocal]
  );

  // Delete widget
  const remove = useCallback(
    async (blockId: number, widgetId: number) => {
      // Clear any pending updates
      const existingTimer = debounceTimers.current.get(widgetId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        debounceTimers.current.delete(widgetId);
      }

      try {
        await deleteWidget(widgetId);
        removeWidgetLocal(blockId, widgetId);
        return true;
      } catch (err) {
        console.error("Error deleting widget:", err);
        return false;
      }
    },
    [removeWidgetLocal]
  );

  const [isDeleting, setIsDeleting] = useState(false);

  // Handle widget deletion
  const handleDelete = useCallback(
    async (widget: Widget, blockId: number) => {
      if (!widget || isDeleting) return;
      if (!confirm("Удалить этот виджет?")) return;

      setIsDeleting(true);
      const success = await remove(blockId, widget.id);
      if (!success) {
        alert("Ошибка при удалении виджета");
      }
      setIsDeleting(false);
    },
    [isDeleting]
  );

  // Handle text change (debounced via useWidgets)
  const handleChange = useCallback(
    (value: string, widget: Widget) => {
      if (!widget) return;
      updateWidget(widget.id, { ...widget.data, text: value });
    },
    [updateWidget]
  );

  // Handle media URL change
  const handleMediaChange = useCallback(
    (url: string, widget: Widget) => {
      if (!widget) return;
      updateWidget(widget.id, { ...widget.data, url });
    },
    [updateWidget]
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File, widget: Widget): Promise<string | null> => {
      if (!widget) return null;

      const result = await uploadFile(widget.id, file);
      if (result) {
        return (result.data?.url as string) || "";
      }
      return null;
    },
    [uploadFile]
  );

  const flushPendingUpdates = useCallback(async () => {
    const timers = debounceTimers.current;
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
  }, []);

  return {
    create,
    update,
    uploadFile,
    remove,
    flushPendingUpdates,
  };
}
