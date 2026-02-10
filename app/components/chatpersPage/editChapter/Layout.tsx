"use client";

import { useRef, useState, useCallback, useEffect, Fragment } from "react";
import { Block } from "@/app/types/block";
import { useSearchParams } from "next/navigation";
import { useBlocks } from "@/app/hooks/useBlocks";
import { PiDotsNine } from "react-icons/pi";
import BlockMenu from "./BlockMenu";
import Column from "./Column";
import ColumnResizer from "./ColumnResizer";
import {
  getColumnsCount,
  groupWidgetsByColumn,
  getDefaultColumnWidths,
} from "./layoutUtils";

type LayoutProps = {
  block: Block;
  dragHandleProps?: Record<string, unknown>;
};

export default function Layout({
  block,
  dragHandleProps,
}: LayoutProps) {
  const { layout_type, widgets, id, style } = block;
  const columnsCount = getColumnsCount(layout_type);
  const groupedWidgets = groupWidgetsByColumn(widgets, columnsCount);
  const params = useSearchParams();
  const isEdit = params.get("edit");
  const { blocks, remove: removeBlock, swap: swapBlocks, updateStyle, updateLayout } = useBlocks();
  const layOurRef = useRef<HTMLDivElement | null>(null);

  const blockColor = style?.color || "";

  // Получаем ширины колонок из style или используем дефолтные
  const defaultWidths = getDefaultColumnWidths(layout_type);
  const [columnWidths, setColumnWidths] = useState<number[]>(
    style?.columnWidths || defaultWidths
  );

  // Синхронизируем с style когда он обновляется с бэка
  useEffect(() => {
    if (style?.columnWidths) {
      setColumnWidths(style.columnWidths);
    } else {
      setColumnWidths(getDefaultColumnWidths(layout_type));
    }
  }, [style?.columnWidths, layout_type]);

  // Минимальная ширина колонки в процентах
  const MIN_COLUMN_WIDTH = 15;

  // Обработчик изменения ширины при перетаскивании
  const handleResize = useCallback(
    (resizerIndex: number, deltaPercent: number) => {
      setColumnWidths((prev) => {
        const newWidths = [...prev];
        const leftCol = resizerIndex;
        const rightCol = resizerIndex + 1;

        // Вычисляем новые ширины
        let newLeftWidth = newWidths[leftCol] + deltaPercent;
        let newRightWidth = newWidths[rightCol] - deltaPercent;

        // Применяем минимальные ограничения
        if (newLeftWidth < MIN_COLUMN_WIDTH) {
          newRightWidth += newLeftWidth - MIN_COLUMN_WIDTH;
          newLeftWidth = MIN_COLUMN_WIDTH;
        }
        if (newRightWidth < MIN_COLUMN_WIDTH) {
          newLeftWidth += newRightWidth - MIN_COLUMN_WIDTH;
          newRightWidth = MIN_COLUMN_WIDTH;
        }

        // Проверяем, что обе колонки остаются в допустимых пределах
        if (newLeftWidth >= MIN_COLUMN_WIDTH && newRightWidth >= MIN_COLUMN_WIDTH) {
          newWidths[leftCol] = newLeftWidth;
          newWidths[rightCol] = newRightWidth;
        }

        return newWidths;
      });
    },
    []
  );

  // Сохранение при завершении перетаскивания
  const handleResizeEnd = useCallback(() => {
    // Округляем до 1 знака после запятой
    const roundedWidths = columnWidths.map((w) => Math.round(w * 10) / 10);
    updateStyle(id, { ...style, columnWidths: roundedWidths });
  }, [columnWidths, id, style, updateStyle]);

  const handleColorChange = (color: string) => {
    updateStyle(id, { ...style, color });
  };

  const handleStyleChange = (newStyle: Block["style"]) => {
    if (newStyle) {
      updateStyle(id, newStyle);
    }
  };

  const handleLayoutChange = (layoutType: string, newColumnsCount: number) => {
    updateLayout(id, layoutType, newColumnsCount);
  };

  const handleDelete = async () => {
    await removeBlock(id);
  };

  const hasCustomBorder = style?.border && typeof style.border === 'object' && 'width' in style.border;

  const getBlockStyles = () => {
    const paddingValue = style?.padding && typeof style.padding === 'object' && 'top' in style.padding
      ? `${(style.padding as { top: number; right: number; bottom: number; left: number }).top}px ${(style.padding as { top: number; right: number; bottom: number; left: number }).right}px ${(style.padding as { top: number; right: number; bottom: number; left: number }).bottom}px ${(style.padding as { top: number; right: number; bottom: number; left: number }).left}px`
      : undefined;
    
    const marginValue = style?.margin && typeof style.margin === 'object' && 'top' in style.margin
      ? `${(style.margin as { top: number; right: number; bottom: number; left: number }).top}px ${(style.margin as { top: number; right: number; bottom: number; left: number }).right}px ${(style.margin as { top: number; right: number; bottom: number; left: number }).bottom}px ${(style.margin as { top: number; right: number; bottom: number; left: number }).left}px`
      : undefined;

    const border = hasCustomBorder
      ? (style.border as { width: number; color: string; radius: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number }; style: string })
      : null;

    const borderValue = border && border.width > 0
      ? `${border.width}px ${border.style || 'solid'} ${border.color || '#000000'}`
      : border && border.width === 0
      ? 'none'
      : undefined; // No border if no custom border defined

    const borderRadiusValue = border?.radius
      ? `${border.radius.topLeft}px ${border.radius.topRight}px ${border.radius.bottomRight}px ${border.radius.bottomLeft}px`
      : undefined;

    return {
      backgroundColor: blockColor || (columnsCount === 1 ? "#f3f4f6" : "#EDEDED"),
      padding: paddingValue,
      margin: marginValue,
      border: borderValue,
      borderRadius: borderRadiusValue,
    };
  };

  const blockIndex = blocks.findIndex((b) => b.id === id);
  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < blocks.length - 1;

  const handleMoveUp = () => {
    if (canMoveUp) {
      swapBlocks(id, blocks[blockIndex - 1].id);
    }
  };

  const handleMoveDown = () => {
    if (canMoveDown) {
      swapBlocks(id, blocks[blockIndex + 1].id);
    }
  };

  const renderEditControls = () => {
    if (!isEdit) return null;

    return (
      <div className="flex-shrink-0 flex flex-col items-center ml-1">
        <BlockMenu
          currentColor={blockColor}
          currentStyle={style}
          currentLayoutType={layout_type}
          columnsCount={columnsCount}
          widgets={widgets}
          onColorChange={handleColorChange}
          onStyleChange={handleStyleChange}
          onLayoutChange={handleLayoutChange}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
        <div
          {...dragHandleProps}
          className="flex p-1 cursor-grab active:cursor-grabbing items-center transition-all duration-150 hover:scale-110 hover:bg-gray-100 rounded"
        >
          <div className="text-gray-400 hover:text-blue-500 transition-colors">
            <PiDotsNine className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  // Single column layout
  if (columnsCount === 1) {
    const columnWidgets = groupedWidgets.get(0) || [];
    return (
      <div
        className="flex group/block w-full"
        ref={layOurRef}
      >
        <div
          className={`w-full rounded-md transition-colors ${hasCustomBorder ? '' : 'ring ring-gray-300'}`}
          style={getBlockStyles()}
        >
          <Column
            blockId={id}
            columnIndex={0}
            widgets={columnWidgets}
            className=""
          />
        </div>
        {renderEditControls()}
      </div>
    );
  }

  // Multi-column layout
  return (
    <div
      className="flex group/block w-full"
      ref={layOurRef}
    >
      <div
        data-layout-container
        className={`w-full flex rounded-md transition-colors overflow-hidden ${hasCustomBorder ? '' : 'ring ring-gray-300'}`}
        style={getBlockStyles()}
      >
        {Array.from({ length: columnsCount }).map((_, colIndex) => {
          const colWidgets = groupedWidgets.get(colIndex) || [];
          const widthPercent = columnWidths[colIndex] || 100 / columnsCount;
          const isLastColumn = colIndex === columnsCount - 1;

          const colColor = style?.columnColors?.[colIndex] || "";

          return (
            <Fragment key={colIndex}>
              {/* Колонка */}
              <div
                className="p-0.5 min-w-0"
                style={{
                  flex: `${widthPercent} 0 0%`,
                  ...(colColor ? { backgroundColor: colColor } : {}),
                }}
              >
                <Column
                  blockId={id}
                  columnIndex={colIndex}
                  widgets={colWidgets}
                />
              </div>

              {/* Resizer между колонками (только в режиме редактирования) */}
              {isEdit && !isLastColumn && (
                <ColumnResizer
                  onResize={(delta) => handleResize(colIndex, delta)}
                  onResizeEnd={handleResizeEnd}
                />
              )}
            </Fragment>
          );
        })}
      </div>
      {renderEditControls()}
    </div>
  );
}
