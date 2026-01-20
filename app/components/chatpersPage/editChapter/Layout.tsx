"use client";

import { useRef } from "react";
import { Block } from "@/app/types/block";
import { useSearchParams } from "next/navigation";
import { useBlocks } from "@/app/hooks/useBlocks";
import { PiDotsNine } from "react-icons/pi";
import BlockMenu from "./BlockMenu";
import Column from "./Column";
import {
  getColumnsCount,
  getColumnClasses,
  groupWidgetsByColumn,
} from "./layoutUtils";

type LayoutProps = {
  block: Block;
  handleDrop?: (targetId: number) => void;
  handleDragStart?: (id: number, e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
};

export default function Layout({
  block,
  handleDrop,
  handleDragStart,
  handleDragOver,
}: LayoutProps) {
  const { layout_type, widgets, id, style } = block;
  const columnsCount = getColumnsCount(layout_type);
  const groupedWidgets = groupWidgetsByColumn(widgets, columnsCount);
  const params = useSearchParams();
  const isEdit = params.get("edit");
  const { remove: removeBlock, updateStyle } = useBlocks();
  const layOurRef = useRef<HTMLDivElement | null>(null);

  const blockColor = style?.color || "";

  const handleColorChange = (color: string) => {
    updateStyle(id, { ...style, color });
  };

  const handleStyleChange = (newStyle: Block["style"]) => {
    if (newStyle) {
      updateStyle(id, newStyle);
    }
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

  const renderEditControls = () => {
    if (!isEdit) return null;

    return (
      <div className="absolute top-2 -right-[40px] opacity-100 transition-opacity">
        <BlockMenu
          currentColor={blockColor}
          currentStyle={style}
          onColorChange={handleColorChange}
          onStyleChange={handleStyleChange}
          onDelete={handleDelete}
        />
        <div
          draggable={true}
          onDragStart={(e) => {
            e.stopPropagation();
            if (handleDragStart) {
              handleDragStart(block.id, e);
            }
          }}
          className="flex p-2 flex-col justify-between cursor-move items-center"
        >
          <div className="flex flex-col gap-0 justify-center text-gray-400 hover:text-gray-600">
            <PiDotsNine className="h-full w-7" />
          </div>
        </div>
      </div>
    );
  };

  // Single column layout
  if (columnsCount === 1) {
    const columnWidgets = groupedWidgets.get(0) || [];
    return (
      <div className="flex group/block w-full" ref={layOurRef}>
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
        {isEdit && (
          <div
            draggable
            onDragStart={(e) => {
              handleDragStart && handleDragStart(block.id, e);
            }}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop && handleDrop(block.id)}
            className="top-2 right-[-40px] opacity-100 transition-opacity"
          >
            <BlockMenu
              currentColor={blockColor}
              currentStyle={style}
              onColorChange={handleColorChange}
              onStyleChange={handleStyleChange}
              onDelete={handleDelete}
            />
            <div className="flex flex-col justify-between items-center gap-1">
              <div className="flex flex-col justify-center gap-0 text-gray-400 hover:text-gray-600">
                <PiDotsNine />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Multi-column layout
  return (
    <div className="relative flex group/block w-full" ref={layOurRef}>
      <div
        className={`w-full flex rounded-md transition-colors ${hasCustomBorder ? '' : 'ring ring-gray-300'}`}
        style={getBlockStyles()}
      >
        {Array.from({ length: columnsCount }).map((_, colIndex) => {
          const columnWidgets = groupedWidgets.get(colIndex) || [];
          const columnClass = getColumnClasses(layout_type, colIndex);
          return (
            <div key={colIndex} className={`${columnClass} p-0.5 mb-2`}>
              <Column
                blockId={id}
                columnIndex={colIndex}
                widgets={columnWidgets}
              />
            </div>
          );
        })}
      </div>
      {renderEditControls()}
    </div>
  );
}
