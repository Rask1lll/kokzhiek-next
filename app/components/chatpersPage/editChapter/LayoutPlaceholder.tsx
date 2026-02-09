"use client";

import React, { useCallback, useState } from "react";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { useWidgets } from "@/app/hooks/useWidgets";
import { useBlocksStore } from "@/app/store/blocksStore";
import { moveWidget as moveWidgetApi } from "@/app/services/constructor/widgetApi";
import { getColumnsCount } from "./layoutUtils";
import WidgetListModal from "./WidgetListModal";
import WidgetMenu from "./WidgetMenu";
import HeadingWidget from "./widgetBlocks/HeadingWidget";
import SubheadingWidget from "./widgetBlocks/SubheadingWidget";
import TextWidget from "./widgetBlocks/TextWidget";
import GlossaryTextWidget from "./widgetBlocks/GlossaryTextWidget";
import GlossaryView from "./viewBlocks/GlossaryView";
import QuoteWidget from "./widgetBlocks/QuoteWidget";
import ListWidget from "./widgetBlocks/ListWidget";
import GenericWidget from "./widgetBlocks/GenericWidget";
import ImageWidget from "./widgetBlocks/ImageWidget";
import VideoWidget from "./widgetBlocks/VideoWidget";
import AudioWidget from "./widgetBlocks/AudioWidget";
import FormulaWidget from "./widgetBlocks/FormulaWidget";
import DividerWidget from "./widgetBlocks/DividerWidget";
import EmbedWidget from "./widgetBlocks/EmbedWidget";
import { Widget } from "@/app/types/widget";
import { useTranslations } from "next-intl";
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
import TaskBlockWrapper from "./taskBlocks/TaskBlockWrapper";
import TaskSettingsMenu from "./taskBlocks/TaskSettingsMenu";
import TableWidget from "./widgetBlocks/TableWidget";
import CarouselWidget from "./widgetBlocks/CarouselWidget";
import { TaskType } from "@/app/types/enums";

const TASK_WIDGET_TYPES = new Set<string>(Object.values(TaskType));

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
  const t = useTranslations("blockEditor");
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
    if (!confirm(t("confirmDeleteWidget"))) return;

    setIsDeleting(true);
    const success = await removeWidget(blockId, widget.id);
    if (!success) {
      alert(t("widgetDeleteError"));
    }
    setIsDeleting(false);
  }, [widget, blockId, isDeleting, removeWidget, t]);

  const handleChange = (value: string) => {
    if (!widget) return;
    console.log(`[LayoutPlaceholder] handleChange for widget ${widget.id}, parent_id: ${widget.parent_id}, blockId: ${blockId}`);
    updateWidget(widget.id, { ...widget.data, text: value });
  };

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

  // Move widget logic
  const { blocks, moveWidgetLocal } = useBlocksStore();

  const currentBlock = blocks.find((b) => b.id === blockId);
  const columnsCount = currentBlock ? getColumnsCount(currentBlock.layout_type) : 1;
  const columnWidgets = currentBlock
    ? currentBlock.widgets.filter((w) => w.column === column).sort((a, b) => a.row - b.row)
    : [];
  const widgetIndexInColumn = widget ? columnWidgets.findIndex((w) => w.id === widget.id) : -1;

  const canMoveUp = widgetIndexInColumn > 0;
  const canMoveDown = widget !== null && widgetIndexInColumn < columnWidgets.length - 1;
  const canMoveLeft = column > 0;
  const canMoveRight = column < columnsCount - 1;

  const handleMoveWidget = useCallback(
    async (newRow: number, newColumn: number) => {
      if (!widget) return;
      moveWidgetLocal(widget.id, newRow, newColumn);
      await moveWidgetApi(widget.id, newRow, newColumn);
    },
    [widget, moveWidgetLocal]
  );

  const handleMoveUp = useCallback(() => {
    if (!widget || !canMoveUp) return;
    const targetWidget = columnWidgets[widgetIndexInColumn - 1];
    // Swap rows
    moveWidgetLocal(widget.id, targetWidget.row, column);
    moveWidgetLocal(targetWidget.id, widget.row, column);
    moveWidgetApi(widget.id, targetWidget.row, column);
    moveWidgetApi(targetWidget.id, widget.row, column);
  }, [widget, canMoveUp, columnWidgets, widgetIndexInColumn, column, moveWidgetLocal]);

  const handleMoveDown = useCallback(() => {
    if (!widget || !canMoveDown) return;
    const targetWidget = columnWidgets[widgetIndexInColumn + 1];
    moveWidgetLocal(widget.id, targetWidget.row, column);
    moveWidgetLocal(targetWidget.id, widget.row, column);
    moveWidgetApi(widget.id, targetWidget.row, column);
    moveWidgetApi(targetWidget.id, widget.row, column);
  }, [widget, canMoveDown, columnWidgets, widgetIndexInColumn, column, moveWidgetLocal]);

  const handleMoveLeft = useCallback(() => {
    if (!widget || !canMoveLeft) return;
    const targetColumn = column - 1;
    const targetColumnWidgets = currentBlock
      ? currentBlock.widgets.filter((w) => w.column === targetColumn)
      : [];
    const newRow = targetColumnWidgets.length > 0
      ? Math.max(...targetColumnWidgets.map((w) => w.row)) + 1
      : 0;
    handleMoveWidget(newRow, targetColumn);
  }, [widget, canMoveLeft, column, currentBlock, handleMoveWidget]);

  const handleMoveRight = useCallback(() => {
    if (!widget || !canMoveRight) return;
    const targetColumn = column + 1;
    const targetColumnWidgets = currentBlock
      ? currentBlock.widgets.filter((w) => w.column === targetColumn)
      : [];
    const newRow = targetColumnWidgets.length > 0
      ? Math.max(...targetColumnWidgets.map((w) => w.row)) + 1
      : 0;
    handleMoveWidget(newRow, targetColumn);
  }, [widget, canMoveRight, column, currentBlock, handleMoveWidget]);

  if (widget) {
    const textValue = (widget.data?.text as string) || "";
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
      case "glossary_text":
        const glossaryData = widget.data as { content?: string; wordIds?: string[] } | undefined;
        widgetContent = (
          <GlossaryTextWidget
            value={{
              content: glossaryData?.content || "",
              wordIds: glossaryData?.wordIds || [],
            }}
            onChange={(value) => updateWidget(widget.id, value)}
          />
        );
        break;
      case "glossary":
        // Glossary widget shows all words from book glossary - no editor needed
        widgetContent = (
          <div className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50">
            <GlossaryView value={widget.data} />
          </div>
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
            value={widget.data}
            onChange={handleMediaChange}
            onTextChange={handleChange}
            onFileUpload={handleFileUpload}
          />
        );
        break;
      case "video":
        widgetContent = (
          <VideoWidget
            value={widget.data}
            onChange={handleMediaChange}
            onTextChange={handleChange}
            onFileUpload={handleFileUpload}
          />
        );
        break;
      case "audio":
        widgetContent = (
          <AudioWidget
            value={widget.data}
            onChange={handleMediaChange}
            onTextChange={handleChange}
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
      case "embed":
        widgetContent = (
          <EmbedWidget value={textValue} onChange={handleChange} />
        );
        break;
      case "multiple_choice":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <MultipleChoice widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "single_choice":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <SingleChoice widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "dropdown":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <DropDown widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "fill_blank":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <FillBlank widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "crossword":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <Crossword widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "match_pairs":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <MatchPairs widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "word_search":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <SearchWord widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "concept_map":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <ConceptMap widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "sort":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <Sort widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "order":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <Order widgetId={widget.id} questionType="order" />
          </TaskBlockWrapper>
        );
        break;
      case "sentence_order":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <Order widgetId={widget.id} questionType="sentence_order" />
          </TaskBlockWrapper>
        );
        break;
      case "drag_drop":
        widgetContent = (
          <TaskBlockWrapper widgetId={widget.id}>
            <DragDrop widgetId={widget.id} />
          </TaskBlockWrapper>
        );
        break;
      case "widget_table":
        widgetContent = (
          <TableWidget
            widget={widget}
            blockId={blockId}
            onUpdate={(data) => updateWidget(widget.id, data)}
          />
        );
        break;
      case "widget_carousel":
        widgetContent = (
          <CarouselWidget
            widget={widget}
            blockId={blockId}
            onUpdate={(data) => updateWidget(widget.id, data)}
          />
        );
        break;
      default:
        widgetContent = <GenericWidget type={widget.type} />;
    }

    return (
      <div className="group relative w-full h-full">
        {widgetContent}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
          <WidgetMenu
            onDelete={handleDelete}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            canMoveLeft={canMoveLeft}
            canMoveRight={canMoveRight}
            isDeleting={isDeleting}
          >
            {TASK_WIDGET_TYPES.has(widget.type) && (
              <TaskSettingsMenu widgetId={widget.id} />
            )}
          </WidgetMenu>
        </div>
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
