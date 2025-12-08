"use client";

import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { BlockWidget, useBlocksStore } from "@/app/store/blocksStore";
import WidgetListModal from "./WidgetListModal";
import HeadingWidget from "./widgetBlocks/HeadingWidget";
import TextWidget from "./widgetBlocks/TextWidget";
import QuoteWidget from "./widgetBlocks/QuoteWidget";
import GenericWidget from "./widgetBlocks/GenericWidget";
import ImageWidget from "./widgetBlocks/ImageWidget";
import VideoWidget from "./widgetBlocks/VideoWidget";
import AudioWidget from "./widgetBlocks/AudioWidget";
import FormulaWidget from "./widgetBlocks/FormulaWidget";

type LayoutPlaceholderProps = {
  blockId: string;
  order: number;
  widget: BlockWidget | null;
};

const LayoutPlaceholder = ({
  blockId,
  order,
  widget,
}: LayoutPlaceholderProps) => {
  const { addContent, removeContent } = useModalWindowStore();
  const setSlotWidget = useBlocksStore((state) => state.setSlotWidget);
  const updateWidgetContent = useBlocksStore(
    (state) => state.updateWidgetContent
  );

  if (widget) {
    const handleChange = (value: string) => {
      updateWidgetContent(blockId, order, value);
    };

    switch (widget.type) {
      case "heading":
        return <HeadingWidget value={widget.content} onChange={handleChange} />;
      case "text":
        return <TextWidget value={widget.content} onChange={handleChange} />;
      case "quote":
        return <QuoteWidget value={widget.content} onChange={handleChange} />;
      case "image":
        return <ImageWidget value={widget.content} onChange={handleChange} />;
      case "video":
        return <VideoWidget value={widget.content} onChange={handleChange} />;
      case "audio":
        return <AudioWidget value={widget.content} onChange={handleChange} />;
      case "formula":
        return <FormulaWidget value={widget.content} onChange={handleChange} />;
      default:
        return <GenericWidget type={widget.type} />;
    }
  }

  const handleOpen = () => {
    addContent(
      <WidgetListModal
        onSelect={(widgetType) => {
          setSlotWidget(blockId, order, widgetType);
          removeContent();
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
