"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { GlossaryTextWidgetData } from "@/app/types/glossary";
import { getBookGlossary } from "@/app/services/book/glossaryApi";
import { GlossaryWord } from "@/app/types/glossary";

type GlossaryTextViewProps = {
  value: GlossaryTextWidgetData;
};

/**
 * Highlight glossary words in HTML content on the client side.
 * Backend strips data-glossary-word attributes, so we find words
 * from the glossary in the text and wrap them with spans.
 */
function highlightGlossaryWords(
  html: string,
  glossaryWords: GlossaryWord[],
  wordIds: string[]
): string {
  if (!html || glossaryWords.length === 0) return html;

  // Only highlight words that belong to this widget
  const relevantWords = wordIds.length > 0
    ? glossaryWords.filter((w) => wordIds.includes(String(w.id)))
    : glossaryWords;

  if (relevantWords.length === 0) return html;

  // Sort by word length descending to match longer phrases first
  const sorted = [...relevantWords].sort((a, b) => b.word.length - a.word.length);

  // Build regex that matches any glossary word (case-insensitive, whole word boundaries)
  const escaped = sorted.map((w) => w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

  // Build a lookup map word -> id (case-insensitive)
  const wordToId = new Map<string, string>();
  sorted.forEach((w) => {
    wordToId.set(w.word.toLowerCase(), String(w.id));
  });

  // Split HTML into tags and text segments, only replace in text segments
  const parts = html.split(/(<[^>]*>)/g);
  const result = parts.map((part) => {
    // Skip HTML tags
    if (part.startsWith("<")) return part;
    // Replace glossary words in text
    return part.replace(pattern, (match) => {
      const id = wordToId.get(match.toLowerCase());
      if (!id) return match;
      return `<span data-glossary-word="${id}">${match}</span>`;
    });
  });

  return result.join("");
}

export default function GlossaryTextView({ value }: GlossaryTextViewProps) {
  const [glossaryWords, setGlossaryWords] = useState<GlossaryWord[]>([]);
  const [glossaryMap, setGlossaryMap] = useState<Map<string, GlossaryWord>>(new Map());
  const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book");
  const containerRef = useRef<HTMLDivElement>(null);

  // Load glossary words
  useEffect(() => {
    if (!bookId) return;
    (async () => {
      const response = await getBookGlossary(bookId);
      if (response.success && response.data) {
        setGlossaryWords(response.data);
        const map = new Map<string, GlossaryWord>();
        response.data.forEach((w) => map.set(String(w.id), w));
        setGlossaryMap(map);
      }
    })();
  }, [bookId]);

  // Build highlighted HTML
  const highlightedHtml = useMemo(
    () => highlightGlossaryWords(value?.content || "", glossaryWords, value?.wordIds || []),
    [value?.content, value?.wordIds, glossaryWords]
  );

  // Handle mouse events for tooltip
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const glossarySpan = target.closest("[data-glossary-word]") as HTMLElement;
      if (!glossarySpan) return;

      const wordId = glossarySpan.getAttribute("data-glossary-word");
      if (!wordId) return;

      const rect = glossarySpan.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setHoveredWordId(String(wordId));
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const glossarySpan = target.closest("[data-glossary-word]") as HTMLElement;
      const relatedTarget = e.relatedTarget as HTMLElement;

      if (glossarySpan && relatedTarget && !glossarySpan.contains(relatedTarget)) {
        setHoveredWordId(null);
      } else if (!glossarySpan) {
        setHoveredWordId(null);
      }
    };

    container.addEventListener("mouseover", handleMouseOver, true);
    container.addEventListener("mouseout", handleMouseOut, true);

    return () => {
      container.removeEventListener("mouseover", handleMouseOver, true);
      container.removeEventListener("mouseout", handleMouseOut, true);
    };
  }, [highlightedHtml]);

  return (
    <div className="relative" ref={containerRef} data-glossary-container>
      <style>{`
        [data-glossary-container] [data-glossary-word] {
          text-decoration: underline;
          text-decoration-style: dotted;
          text-decoration-color: #3b82f6;
          color: #2563eb;
          cursor: pointer;
          padding: 0 2px;
          border-radius: 2px;
          transition: background-color 0.2s;
        }
        [data-glossary-container] [data-glossary-word]:hover {
          background-color: #eff6ff;
        }
      `}</style>
      <div
        className="text-wrap wrap-anywhere max-w-none text-gray-800 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />

      {/* Tooltip */}
      {hoveredWordId && glossaryMap.has(hoveredWordId) && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="font-medium mb-1">
            {glossaryMap.get(hoveredWordId)?.word}
          </div>
          <div className="text-gray-300">
            {glossaryMap.get(hoveredWordId)?.translation}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}
