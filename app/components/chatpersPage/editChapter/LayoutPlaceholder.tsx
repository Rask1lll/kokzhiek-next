"use client";

import { useCallback, useState } from "react";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useWidgets } from "@/app/hooks/useWidgets";
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
import { Widget } from "@/app/types/widget";
import MultipleChoice from "./taskBlocks/MultipleChoice";
import SingleChoice from "./taskBlocks/SingleChoice";
import DropDown from "./taskBlocks/DropDown";
import FillBlank from "./taskBlocks/FillBlank";
import Crossword from "./taskBlocks/Crossword";
import MatchPairs from "./taskBlocks/MatchPairs";
import SearchWord from "./taskBlocks/SearchWord";
import ConceptMap from "./taskBlocks/ConceptMap";
import Sort from "./taskBlocks/Sort";
import Order from "./taskBlocks/Order";
import DragDrop from "./taskBlocks/DragDrop";

type LayoutPlaceholderProps = {
  className?: string;
  blockId: number;
  row: number;
  column: number;
  widget: Widget | null;
};

const LayoutPlaceholder = ({
  className,
  blockId,
  row,
  column,
  widget,
}: LayoutPlaceholderProps) => {
  const { addContent, removeContent } = useModalWindowStore();
  const {
    create: createWidget,
    update: updateWidget,
    uploadFile,
    remove: removeWidget,
  } = useWidgets();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!widget || isDeleting) return;
    if (!confirm("Удалить этот виджет?")) return;

    setIsDeleting(true);
    const success = await removeWidget(blockId, widget.id);
    if (!success) {
      alert("Ошибка при удалении виджета");
    }
    setIsDeleting(false);
  }, [widget, blockId, isDeleting, removeWidget]);

  const handleChange = useCallback(
    (value: string) => {
      if (!widget) return;
      updateWidget(widget.id, { ...widget.data, text: value });
    },
    [widget, updateWidget]
  );

  const handleMediaChange = useCallback(
    (url: string) => {
      if (!widget) return;
      updateWidget(widget.id, { ...widget.data, url });
    },
    [widget, updateWidget]
  );

  const handleFileUpload = useCallback(
    async (file: File): Promise<string | null> => {
      if (!widget) return null;

      const result = await uploadFile(widget?.id, file);
      if (result) {
        return (result.data?.url as string) || "";
      }
      return null;
    },
    [widget, uploadFile]
  );

  if (widget) {
    const textValue = (widget.data?.text as string) || "";
    const urlValue = (widget.data?.url as string) || "";

    let widgetContent: React.ReactNode = null;

    console.log(textValue);

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
      case "multiple_choice":
        widgetContent = <MultipleChoice widgetId={widget.id} />;
        break;
      case "single_choice":
        widgetContent = <SingleChoice widgetId={widget.id} />;
        break;
      case "dropdown":
        widgetContent = <DropDown value={textValue} onChange={handleChange} />;
        break;
      case "fill_blank":
        widgetContent = <FillBlank widgetId={widget.id} />;
        break;
      case "crossword":
        widgetContent = <Crossword value={textValue} onChange={handleChange} />;
        break;
      case "match_pairs":
        widgetContent = <MatchPairs widgetId={widget.id} />;
        break;
      case "word_search":
        widgetContent = (
          <SearchWord value={textValue} onChange={handleChange} />
        );
        break;
      case "concept_map":
        widgetContent = (
          <ConceptMap value={textValue} onChange={handleChange} />
        );
        break;
      case "sort":
        widgetContent = <Sort value={textValue} onChange={handleChange} />;
        break;
      case "order":
        widgetContent = <Order value={textValue} onChange={handleChange} />;
        break;
      case "drag_drop":
        widgetContent = <DragDrop value={textValue} onChange={handleChange} />;
        break;
      default:
        widgetContent = <GenericWidget type={widget.type} />;
    }

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
          await createWidget(blockId, widgetType, {}, row, column);
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
