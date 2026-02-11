"use client";

import { useRef, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiList,
  FiBookOpen,
  FiX,
} from "react-icons/fi";
import { GlossaryTextWidgetData } from "@/app/types/glossary";
import {
  getBookGlossary,
  createGlossaryWord,
  updateGlossaryWord,
  deleteGlossaryWord,
} from "@/app/services/book/glossaryApi";
import { GlossaryWord } from "@/app/types/glossary";

const highlightColors = [
  { color: "#FEF08A", label: "Жёлтый" },
  { color: "#BBF7D0", label: "Зелёный" },
  { color: "#BAE6FD", label: "Голубой" },
  { color: "#FBCFE8", label: "Розовый" },
  { color: "#FED7AA", label: "Оранжевый" },
  { color: "#DDD6FE", label: "Фиолетовый" },
];

type GlossaryTextWidgetProps = {
  value: GlossaryTextWidgetData;
  onChange: (value: GlossaryTextWidgetData) => void;
};

type FontSize = "small" | "normal" | "large" | "xlarge";

const fontSizes: { label: string; value: FontSize; class: string }[] = [
  { label: "S", value: "small", class: "text-sm" },
  { label: "M", value: "normal", class: "text-base" },
  { label: "L", value: "large", class: "text-lg" },
  { label: "XL", value: "xlarge", class: "text-xl" },
];

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

export default function GlossaryTextWidget({
  value,
  onChange,
}: GlossaryTextWidgetProps) {
  const t = useTranslations("glossary");
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [glossaryWords, setGlossaryWords] = useState<GlossaryWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showWordModal, setShowWordModal] = useState(false);
  const [wordText, setWordText] = useState("");
  const [wordTranslation, setWordTranslation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);
  const [showHighlight, setShowHighlight] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);
  const highlightBtnRef = useRef<HTMLButtonElement>(null);
  const [highlightPos, setHighlightPos] = useState({ top: 0, left: 0 });
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book");

  // Load glossary words
  useEffect(() => {
    if (!bookId) return;
    loadGlossary();
  }, [bookId]);

  const loadGlossary = async () => {
    if (!bookId) return;
    const response = await getBookGlossary(bookId);
    if (response.success && response.data) {
      setGlossaryWords(response.data);
    }
  };

  // Initialize content from value
  useEffect(() => {
    if (editorRef.current && value?.content && editorRef.current.innerHTML !== value.content) {
      editorRef.current.innerHTML = value.content;
    }
  }, [value?.content]);

  const handleInput = () => {
    if (!editorRef.current) return;
    
    // Extract wordIds from content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = editorRef.current.innerHTML;
    const glossarySpans = tempDiv.querySelectorAll('[data-glossary-word]');
    const wordIds = Array.from(glossarySpans).map(
      (span) => (span as HTMLElement).getAttribute("data-glossary-word") || ""
    ).filter(Boolean);

    onChange({
      content: editorRef.current.innerHTML,
      wordIds,
    });
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

  const handleAddGlossaryWord = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      alert(t("selectWord"));
      return;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      alert(t("selectWord"));
      return;
    }

    const selectedText = range.toString().trim();
    if (!selectedText) {
      alert(t("selectWord"));
      return;
    }

    // Save the range before opening modal
    savedRangeRef.current = range.cloneRange();
    
    setWordText(selectedText);
    setWordTranslation("");
    setSelectedWord(null);
    setShowWordModal(true);
  };

  const handleSaveWord = async () => {
    if (!wordText.trim() || !wordTranslation.trim() || !bookId) return;

    setIsLoading(true);
    try {
      let wordId: string;

      if (selectedWord) {
        // Update existing word
        const response = await updateGlossaryWord(bookId, selectedWord, {
          word: wordText.trim(),
          translation: wordTranslation.trim(),
        });
        if (!response.success) {
          alert(response.messages?.[0] || t("errorSavingWord"));
          return;
        }
        wordId = selectedWord;
      } else {
        // Create new word
        const response = await createGlossaryWord(
          bookId,
          wordText.trim(),
          wordTranslation.trim()
        );
        if (!response.success || !response.data) {
          alert(response.messages?.[0] || t("errorSavingWord"));
          return;
        }
        wordId = response.data.id;
      }

      // Wrap selected text with glossary span
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.extractContents();
        const span = document.createElement("span");
        span.setAttribute("data-glossary-word", wordId);
        span.className = "glossary-word cursor-pointer underline decoration-dotted decoration-blue-500 text-blue-600";
        span.appendChild(selectedText);
        range.deleteContents();
        range.insertNode(span);

        // Clear selection
        selection.removeAllRanges();
        editorRef.current?.focus();
      }

      await loadGlossary();
      handleInput();
      setShowWordModal(false);
      setWordText("");
      setWordTranslation("");
      setSelectedWord(null);
    } catch (error) {
      console.error("Failed to save word:", error);
      alert(t("errorSavingWord"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveGlossaryWord = async (wordId: string) => {
    if (!bookId) return;
    if (!confirm(t("confirmDeleteWord"))) return;

    setIsLoading(true);
    try {
      const response = await deleteGlossaryWord(bookId, wordId);
      if (!response.success) {
        alert(response.messages?.[0] || t("errorDeletingWord"));
        return;
      }

      // Remove span from content
      if (editorRef.current) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = editorRef.current.innerHTML;
        const spans = tempDiv.querySelectorAll(`[data-glossary-word="${wordId}"]`);
        spans.forEach((span) => {
          const parent = span.parentNode;
          if (parent) {
            parent.replaceChild(document.createTextNode(span.textContent || ""), span);
          }
        });
        editorRef.current.innerHTML = tempDiv.innerHTML;
      }

      await loadGlossary();
      handleInput();
    } catch (error) {
      console.error("Failed to delete word:", error);
      alert(t("errorDeletingWord"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGlossaryWord = (word: GlossaryWord) => {
    setWordText(word.word);
    setWordTranslation(word.translation);
    setSelectedWord(word.id);
    setShowWordModal(true);
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 mb-2 p-1 bg-gray-50 rounded-lg border border-gray-200">
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
        <div className="flex items-center gap-0.5 border-r border-gray-200 pr-2 mr-1">
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

        {/* Add glossary word */}
        <div className="flex items-center gap-0.5">
          <ToolbarButton
            onClick={handleAddGlossaryWord}
            title={t("addWord")}
          >
            <FiBookOpen className="w-4 h-4" />
          </ToolbarButton>
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
        className="w-full text-wrap wrap-anywhere min-h-[80px] outline-none text-gray-800 prose prose-sm max-w-none
          *:my-1 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5
          [&_.glossary-word]:underline [&_.glossary-word]:decoration-dotted [&_.glossary-word]:decoration-blue-500 [&_.glossary-word]:text-blue-600 [&_.glossary-word]:cursor-pointer
          focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        data-placeholder={t("enterText")}
        suppressContentEditableWarning
      />

      {/* Word Modal */}
      {showWordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedWord ? t("editWord") : t("addWord")}
              </h3>
              <button
                onClick={() => {
                  setShowWordModal(false);
                  setWordText("");
                  setWordTranslation("");
                  setSelectedWord(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("word")}
                </label>
                <input
                  type="text"
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={!!selectedWord}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("translation")}
                </label>
                <input
                  type="text"
                  value={wordTranslation}
                  onChange={(e) => setWordTranslation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowWordModal(false);
                    setWordText("");
                    setWordTranslation("");
                    setSelectedWord(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleSaveWord}
                  disabled={isLoading || !wordText.trim() || !wordTranslation.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t("saving") : t("save")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Glossary words list */}
      {glossaryWords.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium mb-2">{t("glossaryWords")}</h4>
          <div className="flex flex-wrap gap-2">
            {glossaryWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center gap-2 px-3 py-1 bg-white rounded-md border border-gray-200 text-sm"
              >
                <span className="font-medium">{word.word}</span>
                <span className="text-gray-500">—</span>
                <span>{word.translation}</span>
                <button
                  onClick={() => handleEditGlossaryWord(word)}
                  className="text-blue-500 hover:text-blue-700 text-xs"
                >
                  {t("edit")}
                </button>
                <button
                  onClick={() => handleRemoveGlossaryWord(word.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  {t("delete")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
