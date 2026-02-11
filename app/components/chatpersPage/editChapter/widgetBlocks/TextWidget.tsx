"use client";

import { useRef, useEffect, useState } from "react";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiList,
} from "react-icons/fi";

const highlightColors = [
  { color: "#FEF08A", label: "Жёлтый" },
  { color: "#BBF7D0", label: "Зелёный" },
  { color: "#BAE6FD", label: "Голубой" },
  { color: "#FBCFE8", label: "Розовый" },
  { color: "#FED7AA", label: "Оранжевый" },
  { color: "#DDD6FE", label: "Фиолетовый" },
];

type TextWidgetProps = {
  value: string;
  onChange: (value: string) => void;
};

type FontSize = "small" | "normal" | "large" | "xlarge";

const fontSizes: { label: string; value: FontSize; class: string }[] = [
  { label: "S", value: "small", class: "text-sm" },
  { label: "M", value: "normal", class: "text-base" },
  { label: "L", value: "large", class: "text-lg" },
  { label: "XL", value: "xlarge", class: "text-xl" },
];

// Toolbar button component - defined outside to avoid recreation during render
function ToolbarButton({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
        active ? "bg-blue-100 text-blue-600" : "text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

export default function TextWidget({ value, onChange }: TextWidgetProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showHighlight, setShowHighlight] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);
  const highlightBtnRef = useRef<HTMLButtonElement>(null);
  const [highlightPos, setHighlightPos] = useState({ top: 0, left: 0 });

  // Initialize content from value
  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
    updateActiveFormats();
    handleInput();
  };

  const updateActiveFormats = () => {
    const formats = new Set<string>();
    if (document.queryCommandState("bold")) formats.add("bold");
    if (document.queryCommandState("italic")) formats.add("italic");
    if (document.queryCommandState("underline")) formats.add("underline");
    if (document.queryCommandState("justifyLeft")) formats.add("alignLeft");
    if (document.queryCommandState("justifyCenter")) formats.add("alignCenter");
    if (document.queryCommandState("justifyRight")) formats.add("alignRight");
    setActiveFormats(formats);
  };

  const handleSelectionChange = () => {
    updateActiveFormats();
  };

  // Close highlight popup on click outside
  useEffect(() => {
    if (!showHighlight) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) {
        setShowHighlight(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHighlight]);

  const toggleHighlight = () => {
    if (!showHighlight && highlightBtnRef.current) {
      const rect = highlightBtnRef.current.getBoundingClientRect();
      setHighlightPos({ top: rect.bottom + 4, left: rect.left });
    }
    setShowHighlight((v) => !v);
  };

  const applyHighlight = (color: string) => {
    execCommand("hiliteColor", color);
    setShowHighlight(false);
  };

  const setFontSize = (size: FontSize) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const selectedText = range.extractContents();
    const span = document.createElement("span");

    const sizeClasses: Record<FontSize, string> = {
      small: "text-sm",
      normal: "text-base",
      large: "text-lg",
      xlarge: "text-xl",
    };

    span.className = sizeClasses[size];
    span.appendChild(selectedText);
    range.insertNode(span);

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.addRange(newRange);

    handleInput();
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div
        className={`flex items-center gap-1 mb-2 p-1 bg-gray-50 rounded-lg border border-gray-200 transition-opacity overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent ${"opacity-100"}`}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db transparent'
        }}
      >
        {/* Text formatting */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton
            onClick={() => execCommand("bold")}
            active={activeFormats.has("bold")}
            title="Жирный (Ctrl+B)"
          >
            <FiBold className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("italic")}
            active={activeFormats.has("italic")}
            title="Курсив (Ctrl+I)"
          >
            <FiItalic className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("underline")}
            active={activeFormats.has("underline")}
            title="Подчеркнутый (Ctrl+U)"
          >
            <FiUnderline className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Font size */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          {fontSizes.map((size) => (
            <button
              key={size.value}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFontSize(size.value)}
              title={`Размер: ${size.label}`}
              className="px-1.5 py-0.5 text-xs font-medium rounded hover:bg-gray-200 text-gray-600 transition-colors"
            >
              {size.label}
            </button>
          ))}
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton
            onClick={() => execCommand("justifyLeft")}
            active={activeFormats.has("alignLeft")}
            title="По левому краю"
          >
            <FiAlignLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyCenter")}
            active={activeFormats.has("alignCenter")}
            title="По центру"
          >
            <FiAlignCenter className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("justifyRight")}
            active={activeFormats.has("alignRight")}
            title="По правому краю"
          >
            <FiAlignRight className="w-4 h-4" />
          </ToolbarButton>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
          <ToolbarButton
            onClick={() => execCommand("insertUnorderedList")}
            title="Маркированный список"
          >
            <FiList className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand("insertOrderedList")}
            title="Нумерованный список"
          >
            <span className="text-xs font-medium">1.</span>
          </ToolbarButton>
        </div>

        {/* Highlight */}
        <div className="flex items-center gap-0.5">
          <button
            ref={highlightBtnRef}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleHighlight}
            title="Выделить цветом"
            className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
              showHighlight ? "bg-blue-100 text-blue-600" : "text-gray-600"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Highlight popup (rendered outside toolbar to avoid overflow clip) */}
      {showHighlight && (
        <div
          ref={highlightRef}
          className="fixed p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 flex items-center gap-1.5"
          style={{ top: highlightPos.top, left: highlightPos.left }}
        >
          {highlightColors.map((h) => (
            <button
              key={h.color}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyHighlight(h.color)}
              title={h.label}
              className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: h.color }}
            />
          ))}
          <label
            title="Свой цвет"
            className="w-6 h-6 rounded-full border border-dashed border-gray-400 hover:scale-110 transition-transform flex items-center justify-center cursor-pointer bg-gradient-to-br from-red-200 via-yellow-200 to-blue-200"
          >
            <span className="text-[10px] font-bold text-gray-500">+</span>
            <input
              type="color"
              className="sr-only"
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => applyHighlight(e.target.value)}
            />
          </label>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyHighlight("transparent")}
            title="Убрать выделение"
            className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform flex items-center justify-center bg-white"
          >
            <svg className="w-3.5 h-3.5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onSelect={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onMouseUp={handleSelectionChange}
        className="w-full text-wrap wrap-anywhere min-h-[80px] p-2 outline-none text-gray-800 prose prose-sm max-w-none
          *:my-1 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5
          focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400
          cursor-text"
        data-placeholder="Введите текст..."
        suppressContentEditableWarning
      />
    </div>
  );
}
