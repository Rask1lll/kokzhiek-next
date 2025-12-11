"use client";

import { useCallback, useState } from "react";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { BlockWidget } from "@/app/store/blocksStore";
import { useBlocksStore } from "@/app/store/blocksStore";
import WidgetListModal from "./WidgetListModal";
import HeadingWidget from "./widgetBlocks/HeadingWidget";
import SubheadingWidget from "./widgetBlocks/SubheadingWidget";
import TextWidget from "./widgetBlocks/TextWidget";
import QuoteWidget from "./widgetBlocks/QuoteWidget";
import ListWidget from "./widgetBlocks/ListWidget";
import GenericWidget from "./widgetBlocks/GenericWidget";
import ImageWidget from "./widgetBlocks/ImageWidget";
import VideoWidget from "./widgetBlocks/VideoWidget";
import AudioWidget from "./widgetBlocks/AudioWidget";
import FormulaWidget from "./widgetBlocks/FormulaWidget";
import DividerWidget from "./widgetBlocks/DividerWidget";
import { FiTrash2 } from "react-icons/fi";
import { WidgetData } from "@/app/types/widget";
import {
  createWidget,
  deleteWidget,
  updateWidget,
  updateWidgetWithFile,
} from "@/app/services/constructor/widgetApi";

type LayoutPlaceholderProps = {
  className?: string;
  blockId: number;
  row: number;
  column: number;
  widget: BlockWidget | null;
};

// Debounce map for widget updates
const debounceTimers = new Map<number, NodeJS.Timeout>();

const LayoutPlaceholder = ({
  className,
  blockId,
  row,
  column,
  widget,
}: LayoutPlaceholderProps) => {
  const { addContent, removeContent } = useModalWindowStore();
  const addWidgetLocal = useBlocksStore((state) => state.addWidgetLocal);
  const updateWidgetLocal = useBlocksStore((state) => state.updateWidgetLocal);
  const removeWidgetLocal = useBlocksStore((state) => state.removeWidgetLocal);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle widget deletion
  const handleDelete = useCallback(async () => {
    if (!widget || isDeleting) return;

    if (!confirm("Удалить этот виджет?")) return;

    setIsDeleting(true);
    try {
      await deleteWidget(widget.id);
      removeWidgetLocal(blockId, widget.id);
    } catch (err) {
      console.error("Error deleting widget:", err);
      alert("Ошибка при удалении виджета");
    } finally {
      setIsDeleting(false);
    }
  }, [widget, blockId, isDeleting, removeWidgetLocal]);

  const handleChange = useCallback(
    (value: string) => {
      if (!widget) return;

      const newData: WidgetData = { ...widget.data, text: value };

      // Optimistic local update
      updateWidgetLocal(widget.id, newData);

      // Clear existing timer for this widget
      const existingTimer = debounceTimers.get(widget.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounced API call
      const timer = setTimeout(async () => {
        try {
          await updateWidget(widget.id, newData);
          debounceTimers.delete(widget.id);
        } catch (err) {
          console.error("Error updating widget:", err);
        }
      }, 500);

      debounceTimers.set(widget.id, timer);
    },
    [widget, updateWidgetLocal]
  );

  // Handle media URL change (for image, video, audio)
  const handleMediaChange = useCallback(
    (url: string) => {
      if (!widget) return;

      const newData: WidgetData = { ...widget.data, url };

      // Optimistic local update
      updateWidgetLocal(widget.id, newData);

      // Clear existing timer for this widget
      const existingTimer = debounceTimers.get(widget.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new debounced API call
      const timer = setTimeout(async () => {
        try {
          await updateWidget(widget.id, newData);
          debounceTimers.delete(widget.id);
        } catch (err) {
          console.error("Error updating widget:", err);
        }
      }, 500);

      debounceTimers.set(widget.id, timer);
    },
    [widget, updateWidgetLocal]
  );

  // Handle file upload (for image, video, audio)
  const handleFileUpload = useCallback(
    async (file: File): Promise<string | null> => {
      if (!widget) return null;

      try {
        const response = await updateWidgetWithFile(widget.id, file);
        console.log("File upload response:", response);

        if (response.success && response.data) {
          const newUrl = (response.data.data?.url as string) || "";
          // Update local store with new data
          updateWidgetLocal(widget.id, response.data.data ?? {});
          return newUrl;
        } else {
          console.error("Failed to upload file:", response.messages);
          return null;
        }
      } catch (err) {
        console.error("Error uploading file:", err);
        return null;
      }
    },
    [widget, updateWidgetLocal]
  );

  if (widget) {
    // Extract value from widget data
    const textValue = (widget.data?.text as string) || "";
    const urlValue = (widget.data?.url as string) || "";

    let widgetContent: React.ReactNode = null;

    switch (widget.type) {
      case "heading":
        widgetContent = (
          <HeadingWidget value={textValue} onChange={handleChange} />
        );
        break;
      case "subheading":
        widgetContent = (
          <SubheadingWidget value={textValue} onChange={handleChange} />
        );
        break;
      case "text":
        widgetContent = (
          <TextWidget value={textValue} onChange={handleChange} />
        );
        break;
      case "quote":
        widgetContent = (
          <QuoteWidget value={textValue} onChange={handleChange} />
        );
        break;
      case "list":
        widgetContent = (
          <ListWidget value={textValue} onChange={handleChange} />
        );
        break;
      case "image":
        widgetContent = (
          <ImageWidget
            value={urlValue}
            onChange={handleMediaChange}
            onFileUpload={handleFileUpload}
          />
        );
        break;
      case "video":
        widgetContent = (
          <VideoWidget
            value={urlValue}
            onChange={handleMediaChange}
            onFileUpload={handleFileUpload}
          />
        );
        break;
      case "audio":
        widgetContent = (
          <AudioWidget
            value={urlValue}
            onChange={handleMediaChange}
            onFileUpload={handleFileUpload}
          />
        );
        break;
      case "formula":
        widgetContent = (
          <FormulaWidget value={textValue} onChange={handleChange} />
        );
        break;
      case "divider":
        widgetContent = (
          <DividerWidget value={textValue} onChange={handleChange} />
        );
        break;
      default:
        widgetContent = <GenericWidget type={widget.type} />;
    }

    // Wrap widget with container that has delete button
    return (
      <div className="group relative w-full h-full">
        {widgetContent}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed z-10"
          title="Удалить виджет"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FiTrash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }

  const handleOpen = () => {
    addContent(
      <WidgetListModal
        onSelect={async (widgetType) => {
          removeContent();

          try {
            console.log("Creating widget:", {
              blockId,
              widgetType,
              row,
              column,
            });
            // Pass row and column so widget is created in the correct position
            const response = await createWidget(
              blockId,
              widgetType,
              {},
              row,
              column
            );
            console.log("Widget API response:", response);

            if (response.success && response.data) {
              // Ensure data field exists, default to empty object
              const widgetData = {
                ...response.data,
                data: response.data.data ?? {},
              };
              console.log("Adding widget to store:", widgetData);
              addWidgetLocal(blockId, widgetData);
            } else {
              console.error("Failed to create widget:", response.messages);
            }
          } catch (err) {
            console.error("Error creating widget:", err);
          }
        }}
      />
    );
  };

  return (
    <div
      onClick={handleOpen}
      className={`w-full h-full flex hover:bg-blue-50 cursor-pointer transition-colors duration-100 items-center justify-center border-2 border-dashed border-gray-300 rounded-md bg-gray-50 ${className}`}
    >
      <span className="text-3xl text-gray-400 font-bold">+</span>
    </div>
  );
};

export default LayoutPlaceholder;
