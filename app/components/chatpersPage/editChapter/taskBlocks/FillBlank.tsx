"use client";

import Button from "@/app/components/Button/Button";
import { useMemo } from "react";

type FillBlankProps = {
  value: string;
  onChange: (value: string) => void;
};

type BlankItem = {
  id: string;
  answer: string;
};

type FillBlankData = {
  text: string;
  blanks: BlankItem[];
};

function parseData(value: string): FillBlankData | undefined {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.text === "string") {
      return parsed;
    }
  } catch {
    return;
  }
}

export default function FillBlank({ value, onChange }: FillBlankProps) {
  const validateData = useMemo(() => parseData(value), [value]);

  const data: FillBlankData = validateData ?? {
    text: "",
    blanks: [],
  };

  const updateData = (newData: FillBlankData) => {
    onChange(JSON.stringify(newData));
  };

  const insertBlank = () => {
    const newBlank: BlankItem = {
      id: data.blanks ? String(data.blanks.length) : "0",
      answer: "",
    };

    const placeholder = `{{${newBlank.id}}}`;
    const newText = data.text + placeholder;

    updateData({
      text: newText,
      blanks: [...(data.blanks || []), newBlank],
    });
  };

  const updateBlankAnswer = (id: string, answer: string) => {
    const newBlanks = (data.blanks || []).map((b) =>
      b.id === id ? { ...b, answer } : b
    );
    updateData({ ...data, blanks: newBlanks });
  };

  const renderPreview = () => {
    const parts = data.text.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const blankId = match[1];
        const blank = (data.blanks || []).find((b) => b.id === blankId);
        if (blank) {
          return (
            <input
              key={index}
              type="text"
              value={blank.answer}
              onChange={(e) => updateBlankAnswer(blank.id, e.target.value)}
              placeholder="ответ"
              className="inline-block mx-1 px-2 py-0.5 w-28 text-center text-sm bg-white border-b-2 border-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="w-full space-y-4">
      {/* Text editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">
            Текст задания:
          </span>
          <Button
            content="+ Вставить пропуск"
            color="blue"
            size="sm"
            onClick={insertBlank}
          />
        </div>

        <textarea
          value={data.text}
          onChange={(e) => updateData({ ...data, text: e.target.value })}
          placeholder="Введите текст. Нажмите '+ Вставить пропуск' для добавления поля ввода."
          className="w-full min-h-[80px] px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Preview with inputs */}
      {data.text && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <span className="text-xs text-slate-400 mb-3 block">
            Заполните правильные ответы:
          </span>
          <div className="text-base text-slate-800 leading-loose">
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
}
