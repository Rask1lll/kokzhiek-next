"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { GlossaryTextWidgetData } from "@/app/types/glossary";
import { getBookGlossary } from "@/app/services/book/glossaryApi";
import { GlossaryWord } from "@/app/types/glossary";

type GlossaryTextViewProps = {
  value: GlossaryTextWidgetData;
};

export default function GlossaryTextView({ value }: GlossaryTextViewProps) {
  const [glossaryWords, setGlossaryWords] = useState<Map<string, GlossaryWord>>(new Map());
  const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book");
  const containerRef = useRef<HTMLDivElement>(null);

  // Load glossary words - always load if bookId exists
  useEffect(() => {
    if (!bookId) return;
    loadGlossary();
  }, [bookId]);

  const loadGlossary = async () => {
    if (!bookId) return;
    const response = await getBookGlossary(bookId);
    if (response.success && response.data) {
      const wordsMap = new Map<string, GlossaryWord>();
      response.data.forEach((word) => {
        wordsMap.set(String(word.id), word);
      });
      setGlossaryWords(wordsMap);
    }
  };

  // Apply styles and handle mouse events on glossary words
  useEffect(() => {
    if (!value?.content) return;

    const container = containerRef.current;
    if (!container) return;

    let cleanup: (() => void) | null = null;

    // Wait for DOM to update after dangerouslySetInnerHTML
    const timeoutId = setTimeout(() => {
      // Apply styles to glossary words
      const glossarySpans = container.querySelectorAll('[data-glossary-word]');
      glossarySpans.forEach((span) => {
        const element = span as HTMLElement;
        const wordId = element.getAttribute("data-glossary-word");
        
        // Only apply styles if word exists in glossary
        const wordIdStr = String(wordId || "");
        if (wordId && glossaryWords.has(wordIdStr)) {
          element.style.textDecoration = 'underline';
          element.style.textDecorationStyle = 'dotted';
          element.style.textDecorationColor = '#3b82f6';
          element.style.color = '#2563eb';
          element.style.cursor = 'pointer';
          element.style.paddingLeft = '2px';
          element.style.paddingRight = '2px';
          element.style.borderRadius = '2px';
          element.style.transition = 'background-color 0.2s';
        }
      });

      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target) return;
        
        const glossarySpan = target.closest('[data-glossary-word]') as HTMLElement;
        
        if (glossarySpan) {
          const wordId = glossarySpan.getAttribute("data-glossary-word");
          const wordIdStr = String(wordId || "");
          if (wordId && glossaryWords.has(wordIdStr)) {
            // Add hover background
            glossarySpan.style.backgroundColor = '#eff6ff';
            
            const rect = glossarySpan.getBoundingClientRect();
            setTooltipPosition({
              x: rect.left + rect.width / 2,
              y: rect.top - 10,
            });
            setHoveredWordId(wordIdStr);
          }
        }
      };

      const handleMouseOut = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target) return;
        
        const glossarySpan = target.closest('[data-glossary-word]') as HTMLElement;
        const relatedTarget = e.relatedTarget as HTMLElement;
        
        // Remove hover background
        if (glossarySpan) {
          glossarySpan.style.backgroundColor = '';
        }
        
        // Hide tooltip if mouse leaves the glossary span
        if (glossarySpan && relatedTarget && !glossarySpan.contains(relatedTarget)) {
          setHoveredWordId(null);
        } else if (!glossarySpan) {
          setHoveredWordId(null);
        }
      };

      // Use capture phase to catch events on dynamically inserted elements
      container.addEventListener("mouseover", handleMouseOver, true);
      container.addEventListener("mouseout", handleMouseOut, true);
      
      cleanup = () => {
        container.removeEventListener("mouseover", handleMouseOver, true);
        container.removeEventListener("mouseout", handleMouseOut, true);
        // Remove inline styles and event listeners from spans
        glossarySpans.forEach((span) => {
          const element = span as HTMLElement;
          element.style.textDecoration = '';
          element.style.textDecorationStyle = '';
          element.style.textDecorationColor = '';
          element.style.color = '';
          element.style.cursor = '';
          element.style.paddingLeft = '';
          element.style.paddingRight = '';
          element.style.borderRadius = '';
          element.style.transition = '';
          element.style.backgroundColor = '';
        });
      };
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (cleanup) {
        cleanup();
      }
    };
  }, [value?.content, glossaryWords]);


  return (
    <div className="relative" ref={containerRef} data-glossary-container>
      <div
        className="text-wrap wrap-anywhere max-w-none text-gray-800 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5
          [&_[data-glossary-word]]:underline [&_[data-glossary-word]]:decoration-dotted 
          [&_[data-glossary-word]]:decoration-blue-500 [&_[data-glossary-word]]:text-blue-600 
          [&_[data-glossary-word]]:cursor-pointer [&_[data-glossary-word]]:hover:bg-blue-50 
          [&_[data-glossary-word]]:transition-colors [&_[data-glossary-word]]:px-0.5 [&_[data-glossary-word]]:rounded"
        dangerouslySetInnerHTML={{ __html: value?.content || "" }}
      />

      {/* Tooltip */}
      {hoveredWordId && glossaryWords.has(hoveredWordId) && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg pointer-events-none
            transform -translate-x-1/2 -translate-y-full mb-2"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="font-medium mb-1">
            {glossaryWords.get(hoveredWordId)?.word}
          </div>
          <div className="text-gray-300">
            {glossaryWords.get(hoveredWordId)?.translation}
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-gray-900 transform rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}
