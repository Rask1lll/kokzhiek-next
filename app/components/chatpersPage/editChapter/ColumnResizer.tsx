"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ColumnResizerProps = {
  onResize: (deltaPercent: number) => void;
  onResizeEnd: () => void;
};

export default function ColumnResizer({
  onResize,
  onResizeEnd,
}: ColumnResizerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const containerWidthRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    startXRef.current = e.clientX;

    // Получаем ширину родительского контейнера для расчета процентов
    const container = (e.target as HTMLElement).closest('[data-layout-container]');
    if (container) {
      containerWidthRef.current = container.getBoundingClientRect().width;
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerWidthRef.current) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaPercent = (deltaX / containerWidthRef.current) * 100;

      onResize(deltaPercent);
      startXRef.current = e.clientX;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onResize, onResizeEnd]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        w-2 cursor-col-resize flex-shrink-0 relative z-10
        group/resizer hover:bg-blue-400 transition-colors
        ${isDragging ? "bg-blue-500" : "bg-transparent"}
      `}
      title="Перетащите для изменения ширины"
    >
      {/* Визуальный индикатор при наведении */}
      <div
        className={`
          absolute inset-y-0 left-1/2 -translate-x-1/2 w-1
          rounded-full transition-opacity
          ${isDragging ? "bg-blue-500 opacity-100" : "bg-gray-400 opacity-0 group-hover/resizer:opacity-100"}
        `}
      />
    </div>
  );
}
