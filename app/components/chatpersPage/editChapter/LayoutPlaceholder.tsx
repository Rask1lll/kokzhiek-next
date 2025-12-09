"use client";

import { useCallback } from "react";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { BlockWidget } from "@/app/store/blocksStore";
import {
  createWidget,
  updateWidget,
  updateWidgetWithFile,
  ApiWidgetData,
} from "@/app/services/constructorApi";
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

type LayoutPlaceholderProps = {
  blockId: number;
  order: number;
  widget: BlockWidget | null;
};

// Debounce map for widget updates
const debounceTimers = new Map<number, NodeJS.Timeout>();

const LayoutPlaceholder = ({
  blockId,
  order,
  widget,
}: LayoutPlaceholderProps) => {
  const { addContent, removeContent } = useModalWindowStore();
  const addWidgetLocal = useBlocksStore((state) => state.addWidgetLocal);
  const updateWidgetLocal = useBlocksStore((state) => state.updateWidgetLocal);

  // Handle widget content change with debounced API call
  const handleChange = useCallback(
    (value: string) => {
      if (!widget) return;

      const newData: ApiWidgetData = { ...widget.data, text: value };

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

      const newData: ApiWidgetData = { ...widget.data, url };

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

    switch (widget.type) {
      case "heading":
        return <HeadingWidget value={textValue} onChange={handleChange} />;
      case "subheading":
        return <SubheadingWidget value={textValue} onChange={handleChange} />;
      case "text":
        return <TextWidget value={textValue} onChange={handleChange} />;
      case "quote":
        return <QuoteWidget value={textValue} onChange={handleChange} />;
      case "list":
        return <ListWidget value={textValue} onChange={handleChange} />;
      case "image":
        return (
          <ImageWidget
            value={urlValue}
            onChange={handleMediaChange}
            onFileUpload={handleFileUpload}
          />
        );
      case "video":
        return (
          <VideoWidget
            value={urlValue}
            onChange={handleMediaChange}
            onFileUpload={handleFileUpload}
          />
        );
      case "audio":
        return (
          <AudioWidget
            value={urlValue}
            onChange={handleMediaChange}
            onFileUpload={handleFileUpload}
          />
        );

      case "formula":
        return <FormulaWidget value={textValue} onChange={handleChange} />;
      case "divider":
        return <DividerWidget value={textValue} onChange={handleChange} />;
      default:
        return <GenericWidget type={widget.type} />;
    }
  }

  const handleOpen = () => {
    addContent(
      <WidgetListModal
        onSelect={async (widgetType) => {
          removeContent();

          try {
            console.log("Creating widget:", { blockId, widgetType, order });
            // Pass the slot order so widget is created in the correct position
            const response = await createWidget(blockId, widgetType, {}, order);
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
      className="w-full h-full flex hover:bg-blue-50 cursor-pointer transition-colors duration-100 items-center justify-center border-2 border-dashed border-gray-300 rounded-md bg-gray-50"
    >
      <span className="text-3xl text-gray-400 font-bold">+</span>
    </div>
  );
};

export default LayoutPlaceholder;
