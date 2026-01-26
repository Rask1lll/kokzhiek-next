"use client";

import { useState, useCallback, useMemo } from "react";
import { Widget } from "@/app/types/widget";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ViewPlaceholder from "../ViewPlaceholder";

type CarouselViewProps = {
  widget: Widget;
};

export default function CarouselView({ widget }: CarouselViewProps) {
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

  // Navigate to previous slide
  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  // Navigate to next slide
  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  // Memoize slides array
  const slidesArray = useMemo(
    () => Array.from({ length: totalSlides }, (_, i) => i),
    [totalSlides]
  );

  return (
    <div className="w-full">
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
            {slidesArray.map((slideIndex) => {
              const slideWidget = getWidgetAtSlide(slideIndex);
              return (
                <div
                  key={slideIndex}
                  className="min-h-[200px] p-4 w-full flex-shrink-0"
                >
                  {slideWidget ? (
                    <ViewPlaceholder widget={slideWidget} />
                  ) : (
                    <div className="w-full h-full min-h-[200px] flex items-center justify-center text-gray-400">
                      {/* Empty slide */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dots indicator */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-2 pb-4">
            {slidesArray.map((i) => (
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
