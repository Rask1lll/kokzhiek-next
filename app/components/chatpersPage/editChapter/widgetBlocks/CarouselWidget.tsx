"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Widget, WidgetData } from "@/app/types/widget";
import { FiPlus, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { createChildWidget, deleteWidget } from "@/app/services/constructor/widgetApi";
import { useBlocksStore } from "@/app/store/blocksStore";
import WidgetListModal from "../WidgetListModal";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import LayoutPlaceholder from "../LayoutPlaceholder";

type CarouselWidgetProps = {
  widget: Widget;
  blockId: number;
  onUpdate: (data: WidgetData) => void;
};

export default function CarouselWidget({
  widget,
  blockId,
  onUpdate,
}: CarouselWidgetProps) {
  const t = useTranslations("blockEditor");
  const { addChildWidgetLocal, removeChildWidgetLocal } = useBlocksStore();
  const { addContent, removeContent } = useModalWindowStore();

  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselData = widget.data as {
    slides?: number;
  };

  const totalSlides = carouselData?.slides || 1;
  const children = widget.children || [];

  // Get widget at specific slide (column = slide index, row = 0)
  const getWidgetAtSlide = useCallback(
    (slideIndex: number): Widget | null => {
      return children.find((w) => w.column === slideIndex && w.row === 0) || null;
    },
    [children]
  );

  // Add new slide
  const handleAddSlide = useCallback(() => {
    const newSlidesCount = totalSlides + 1;
    onUpdate({
      ...widget.data,
      slides: newSlidesCount,
    });
    // Navigate to new slide
    setCurrentSlide(newSlidesCount - 1);
  }, [widget.data, totalSlides, onUpdate]);

  // Remove current slide
  const handleRemoveSlide = useCallback(async () => {
    if (totalSlides <= 1) return;

    // Delete widget in current slide if exists
    const slideWidget = getWidgetAtSlide(currentSlide);
    if (slideWidget) {
      await deleteWidget(slideWidget.id);
      removeChildWidgetLocal(widget.id, slideWidget.id);
    }

    // Shift widgets in slides after current one
    // Note: This would require a more complex reordering API call
    // For simplicity, we'll just decrease slides count

    onUpdate({
      ...widget.data,
      slides: totalSlides - 1,
    });

    // Navigate to previous slide if we're on the last one
    if (currentSlide >= totalSlides - 1) {
      setCurrentSlide(Math.max(0, totalSlides - 2));
    }
  }, [totalSlides, currentSlide, widget.id, widget.data, onUpdate, getWidgetAtSlide, removeChildWidgetLocal]);

  // Handle adding widget to current slide
  const handleAddWidgetToSlide = useCallback(() => {
    addContent(
      <WidgetListModal
        onSelect={async (widgetType) => {
          removeContent();
          const response = await createChildWidget(
            blockId,
            widget.id,
            widgetType,
            {},
            0, // row = 0
            currentSlide // column = slide index
          );
          if (response.success && response.data) {
            addChildWidgetLocal(widget.id, response.data);
          }
        }}
      />
    );
  }, [blockId, widget.id, currentSlide, addContent, removeContent, addChildWidgetLocal]);

  // Navigate to previous slide
  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  // Navigate to next slide
  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  return (
    <div className="w-full p-2">
      {/* Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <button
            onClick={handleAddSlide}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            {t("addSlide")}
          </button>
          {totalSlides > 1 && (
            <button
              onClick={handleRemoveSlide}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            >
              <FiTrash2 className="w-4 h-4" />
              {t("removeSlide")}
            </button>
          )}
        </div>

        {/* Slide indicator */}
        <div className="text-sm text-gray-500">
          {currentSlide + 1} / {totalSlides}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
        {/* Navigation buttons */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
            >
              <FiChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white/80 rounded-full shadow-md hover:bg-white transition-colors"
            >
              <FiChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </>
        )}

        {/* Slides container with animation */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {Array.from({ length: totalSlides }, (_, slideIndex) => {
              const slideWidget = getWidgetAtSlide(slideIndex);
              return (
                <div
                  key={slideIndex}
                  className="min-h-[200px] p-4 w-full flex-shrink-0"
                >
                  {slideWidget ? (
                    <LayoutPlaceholder
                      blockId={blockId}
                      row={0}
                      column={slideIndex}
                      widget={slideWidget}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        setCurrentSlide(slideIndex);
                        handleAddWidgetToSlide();
                      }}
                      className="w-full h-full min-h-[200px] flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-md border-2 border-dashed border-gray-300 transition-colors"
                    >
                      <FiPlus className="w-8 h-8 mb-2" />
                      <span className="text-sm">{t("addWidgetToSlide")}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots indicator */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-2 pb-4">
            {Array.from({ length: totalSlides }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "bg-blue-500 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
