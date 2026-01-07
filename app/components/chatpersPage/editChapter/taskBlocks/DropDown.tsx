"use client";

import Button from "@/app/components/Button/Button";
import { useEffect, useCallback, useRef, useState } from "react";
import { FiX, FiChevronDown } from "react-icons/fi";
import { useQuestions } from "@/app/hooks/useQuestions";
import { Question } from "@/app/types/question";
import { useTranslations } from "next-intl";

type DropDownProps = {
  widgetId: number;
};

type DropdownData = {
  id: string;
  correct_index: number;
};

export default function DropDown({ widgetId }: DropDownProps) {
  const t = useTranslations("taskEditor");
  const { questions, loading, update } = useQuestions(widgetId);

  // Get first question from array
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(
    Array.isArray(questions) && questions.length > 0 ? questions[0] : null
  );

  useEffect(() => {
    if (Array.isArray(questions) && questions.length > 0) {
      const firstQuestion = questions[0];
      // Only update if question ID changed
      if (!currentQuestion || currentQuestion.id !== firstQuestion.id) {
        setTimeout(() => {
          setCurrentQuestion(firstQuestion);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [editingDropdown, setEditingDropdown] = useState<string | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    const debounceTimer = debounceTimerRef.current;
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, []);

  const updateQuestionBody = useCallback(
    (body: string) => {
      if (!currentQuestion?.id) return;

      // Update UI immediately
      setCurrentQuestion((prev) => (prev ? { ...prev, body } : prev));

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Debounce server update
      const questionId = currentQuestion.id;
      debounceTimerRef.current = setTimeout(() => {
        if (!questionId) return;
        const trimmedBody = body;
        if (trimmedBody.length === 0) return;

        update(questionId, { body: trimmedBody });
      }, 500);
    },
    [currentQuestion, update]
  );

  const insertDropdown = useCallback(async () => {
    if (!currentQuestion?.id) return;

    const dropdowns = (currentQuestion.data?.dropdowns as DropdownData[]) || [];
    const dropdownId = `dropdown${dropdowns.length + 1}`;
    const placeholder = `{{${dropdownId}}}`;
    const newBody = (currentQuestion.body || "") + placeholder;
    const newDropdowns = [...dropdowns, { id: dropdownId, correct_index: 0 }];

    // Create initial options for this dropdown
    const newOptions = [
      ...(currentQuestion.options || []),
      {
        body: "",
        image_url: null,
        is_correct: true,
        match_id: dropdownId,
        group: null,
        order: 0,
      },
      {
        body: "",
        image_url: null,
        is_correct: false,
        match_id: dropdownId,
        group: null,
        order: 1,
      },
    ];

    // Send to server and wait for response
    const updated = await update(currentQuestion.id, {
      options: newOptions,
      body: newBody,
      data: { dropdowns: newDropdowns },
    });
    if (updated) {
      // Update UI with data from server
      setCurrentQuestion(updated);
    }
  }, [currentQuestion, update]);

  const removeDropdown = useCallback(
    async (dropdownId: string) => {
      if (!currentQuestion?.id) return;

      const dropdowns =
        (currentQuestion.data?.dropdowns as DropdownData[]) || [];
      const placeholder = `{{${dropdownId}}}`;
      const newBody = (currentQuestion.body || "").replace(placeholder, "");
      const newDropdowns = dropdowns.filter((d) => d.id !== dropdownId);

      // Remove all options with this match_id
      const newOptions = (currentQuestion.options || []).filter(
        (opt) => opt.match_id !== dropdownId
      );

      // Send to server and wait for response
      const updated = await update(currentQuestion.id, {
        options: newOptions,
        body: newBody,
        data: { dropdowns: newDropdowns },
      });
      if (updated) {
        setCurrentQuestion(updated);
        setEditingDropdown(null);
      }
    },
    [currentQuestion, update]
  );

  const addOptionToDropdown = useCallback(
    async (dropdownId: string) => {
      if (!currentQuestion?.id) return;

      // Get existing options for this dropdown
      const dropdownOptions = (currentQuestion.options || []).filter(
        (opt) => opt.match_id === dropdownId
      );
      const nextPosition = dropdownOptions.length;

      const newOptions = [
        ...(currentQuestion.options || []),
        {
          body: ``,
          image_url: null,
          is_correct: false,
          match_id: dropdownId,
          group: null,
          order: nextPosition,
        },
      ];

      // Send to server and wait for response
      const updated = await update(currentQuestion.id, {
        options: newOptions,
      });
      if (updated) {
        setCurrentQuestion(updated);
      }
    },
    [currentQuestion, update]
  );

  const updateOptionText = useCallback(
    async (dropdownId: string, optionId: number | undefined, text: string) => {
      console.log(text);
      if (!currentQuestion?.id || optionId === undefined) return;

      const newOptions = (currentQuestion.options || []).map((opt) =>
        opt.id === optionId ? { ...opt, body: text } : opt
      );

      // Update UI immediately

      // Send to server
      update(currentQuestion.id, { options: newOptions });

      setCurrentQuestion((prev) =>
        prev ? { ...prev, options: newOptions } : prev
      );
    },
    [currentQuestion, update]
  );

  const removeOption = useCallback(
    async (dropdownId: string, optionId: number | undefined) => {
      if (!currentQuestion?.id || optionId === undefined) return;

      // Get dropdown options
      const dropdownOptions = (currentQuestion.options || []).filter(
        (opt) => opt.match_id === dropdownId
      );
      if (dropdownOptions.length <= 2) return;

      // Get dropdown data to update correct_index if needed
      const dropdowns =
        (currentQuestion.data?.dropdowns as DropdownData[]) || [];
      const dropdown = dropdowns.find((d) => d.id === dropdownId);
      if (!dropdown) return;

      // Find option to remove
      const optionToRemove = dropdownOptions.find((opt) => opt.id === optionId);
      if (!optionToRemove) return;

      const removedPosition = optionToRemove.order || 0;

      // Remove option
      const newOptions = (currentQuestion.options || []).filter(
        (opt) => opt.id !== optionId
      );

      // Update positions for remaining options
      const reorderedOptions = newOptions.map((opt) => {
        if (
          opt.match_id === dropdownId &&
          opt.order !== undefined &&
          opt.order > removedPosition
        ) {
          return { ...opt, order: opt.order - 1 };
        }
        return opt;
      });

      // Update correct_index if needed
      let newCorrectIndex = dropdown.correct_index;
      if (dropdown.correct_index === removedPosition) {
        newCorrectIndex = Math.max(0, dropdown.correct_index - 1);
      } else if (dropdown.correct_index > removedPosition) {
        newCorrectIndex = dropdown.correct_index - 1;
      }

      const newDropdowns = dropdowns.map((d) =>
        d.id === dropdownId ? { ...d, correct_index: newCorrectIndex } : d
      );

      // Send to server and wait for response
      const updated = await update(currentQuestion.id, {
        options: reorderedOptions,
        data: { dropdowns: newDropdowns },
      });
      if (updated) {
        setCurrentQuestion(updated);
      }
    },
    [currentQuestion, update]
  );

  const updateCorrectIndex = useCallback(
    async (dropdownId: string, correctIndex: number) => {
      if (!currentQuestion?.id) return;

      const dropdowns =
        (currentQuestion.data?.dropdowns as DropdownData[]) || [];
      const newDropdowns = dropdowns.map((d) =>
        d.id === dropdownId ? { ...d, correct_index: correctIndex } : d
      );

      // Update UI immediately
      setCurrentQuestion((prev) =>
        prev
          ? { ...prev, data: { ...prev.data, dropdowns: newDropdowns } }
          : prev
      );

      // Send to server
      update(currentQuestion.id, { data: { dropdowns: newDropdowns } });
    },
    [currentQuestion, update]
  );

  // Render text with inline dropdowns
  const renderPreview = () => {
    if (!currentQuestion?.body) return null;

    const parts = (currentQuestion.body || "").split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const dropdownId = match[1];
        const dropdowns =
          (currentQuestion.data?.dropdowns as DropdownData[]) || [];
        const dropdown = dropdowns.find((d) => d.id === dropdownId);
        if (dropdown) {
          // Get options for this dropdown
          const dropdownOptions = (currentQuestion.options || [])
            .filter((opt) => opt.match_id === dropdownId)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

          const correctOption = dropdownOptions[dropdown.correct_index];

          return (
            <span key={index} className="inline-block mx-1">
              <button
                type="button"
                onClick={() =>
                  setEditingDropdown(
                    editingDropdown === dropdownId ? null : dropdownId
                  )
                }
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-sm transition-colors ${
                  editingDropdown === dropdownId
                    ? "bg-blue-100 border-blue-400 text-blue-700"
                    : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {correctOption?.body || "..."}
                <FiChevronDown className="w-3 h-3" />
              </button>
            </span>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Get dropdown being edited
  const dropdowns = (currentQuestion?.data?.dropdowns as DropdownData[]) || [];
  const currentDropdown = editingDropdown
    ? dropdowns.find((d) => d.id === editingDropdown)
    : null;

  // Get options for current dropdown
  const currentDropdownOptions = currentDropdown
    ? (currentQuestion?.options || [])
        .filter((opt) => opt.match_id === currentDropdown.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  // Show loading state while loading
  if (loading) {
    return (
      <div className="w-full space-y-4 p-4">
        <div className="animate-pulse">{t("loading")}</div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="w-full space-y-4 p-4 text-gray-500">{t("loadError")}</div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Text editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            {t("taskLabel")}
          </span>
          <Button
            content={t("insertList")}
            color="blue"
            size="sm"
            onClick={insertDropdown}
          />
        </div>

        <textarea
          spellCheck
          value={currentQuestion.body || ""}
          onChange={(e) => updateQuestionBody(e.target.value)}
          placeholder={t("insertListPlaceholder")}
          className="w-full min-h-[100px] px-3 py-2 text-base md:text-lg lg:text-xl bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />

        <p className="text-sm md:text-base lg:text-lg text-slate-400">
          {t("hintDropdown", { placeholder: "{{id}}" })}
        </p>
      </div>

      {/* Preview */}
      {currentQuestion.body && (
        <div className="p-4 bg-white rounded-lg border border-dashed border-slate-300">
          <span className="text-sm md:text-base lg:text-lg text-slate-400 mb-2 block">
            {t("previewClick")}
          </span>
          <div className="text-lg md:text-xl lg:text-2xl text-slate-800 leading-relaxed">
            {renderPreview()}
          </div>
        </div>
      )}

      {/* Dropdown editor */}
      {currentDropdown && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-base md:text-lg lg:text-xl font-medium text-blue-800">
              {t("editingList")}
            </span>
            <div className="flex gap-2">
              <Button
                content={t("deleteList")}
                color="red"
                size="sm"
                onClick={() => removeDropdown(currentDropdown.id)}
              />
              <button
                type="button"
                onClick={() => setEditingDropdown(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <span className="text-sm md:text-base lg:text-lg text-blue-600">
              {t("optionsCorrect")}
            </span>
            {currentDropdownOptions.map((option, index) => (
              <div key={option.id || index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${currentDropdown.id}`}
                  checked={currentDropdown.correct_index === index}
                  onChange={() => updateCorrectIndex(currentDropdown.id, index)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <input
                  spellCheck={false}
                  type="text"
                  value={option.body || ""}
                  onChange={(e) =>
                    updateOptionText(
                      currentDropdown.id,
                      option.id,
                      e.target.value
                    )
                  }
                  placeholder={t("Variant")}
                  className="flex-1 px-2 py-1 text-base md:text-lg lg:text-xl bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => removeOption(currentDropdown.id, option.id)}
                  disabled={currentDropdownOptions.length <= 2}
                  className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
            <Button
              content={t("addVariant")}
              color="slate"
              size="sm"
              onClick={() => addOptionToDropdown(currentDropdown.id)}
            />
          </div>
        </div>
      )}

      {/* List of all dropdowns */}
      {dropdowns.length > 0 && !editingDropdown && (
        <div className="space-y-2">
          <span className="text-base md:text-lg lg:text-xl font-medium text-slate-700">
            {t("allLists")}
          </span>
          {dropdowns.map((dropdown, index) => {
            const dropdownOptions = (currentQuestion.options || [])
              .filter((opt) => opt.match_id === dropdown.id)
              .sort((a, b) => (a.order || 0) - (b.order || 0));
            const correctOption = dropdownOptions[dropdown.correct_index];

            return (
              <div
                key={dropdown.id}
                onClick={() => setEditingDropdown(dropdown.id)}
                className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-base lg:text-lg text-slate-400">
                    #{index + 1}
                  </span>
                  <span className="text-base md:text-lg lg:text-xl text-slate-700">
                    {dropdownOptions.map((opt) => opt.body).join(" / ")}
                  </span>
                </div>
                <span className="text-sm md:text-base lg:text-lg text-green-600">
                  ✓ {correctOption?.body || "..."}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
