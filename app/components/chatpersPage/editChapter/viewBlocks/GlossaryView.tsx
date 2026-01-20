"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getBookGlossary } from "@/app/services/book/glossaryApi";
import { GlossaryWord } from "@/app/types/glossary";

type GlossaryViewProps = {
  value?: Record<string, unknown>;
};

// Kazakh alphabet letters
const KAZAKH_ALPHABET = [
  "А", "Ә", "Б", "В", "Г", "Ғ", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Қ",
  "Л", "М", "Н", "Ң", "О", "Ө", "П", "Р", "С", "Т", "У", "Ү", "Ұ", "Ф", "Х",
  "Һ", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "І", "Ь", "Э", "Ю", "Я"
];

// Russian alphabet letters
const RUSSIAN_ALPHABET = [
  "А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н",
  "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь",
  "Э", "Ю", "Я"
];

function getFirstLetter(word: string): string {
  if (!word) return "";
  const firstChar = word.trim().charAt(0).toUpperCase();
  return firstChar;
}

function groupWordsByLetter(words: GlossaryWord[]): Map<string, GlossaryWord[]> {
  const grouped = new Map<string, GlossaryWord[]>();
  
  words.forEach((word) => {
    const letter = getFirstLetter(word.word);
    if (!grouped.has(letter)) {
      grouped.set(letter, []);
    }
    grouped.get(letter)!.push(word);
  });
  
  // Sort words within each group
  grouped.forEach((wordList) => {
    wordList.sort((a, b) => a.word.localeCompare(b.word, "kk"));
  });
  
  return grouped;
}

function getAllLetters(groupedWords: Map<string, GlossaryWord[]>): string[] {
  const letters = Array.from(groupedWords.keys());
  // Sort letters according to Kazakh alphabet order
  return letters.sort((a, b) => {
    const indexA = KAZAKH_ALPHABET.indexOf(a) !== -1 
      ? KAZAKH_ALPHABET.indexOf(a) 
      : RUSSIAN_ALPHABET.indexOf(a) !== -1 
        ? RUSSIAN_ALPHABET.indexOf(a) + 1000 
        : 9999;
    const indexB = KAZAKH_ALPHABET.indexOf(b) !== -1 
      ? KAZAKH_ALPHABET.indexOf(b) 
      : RUSSIAN_ALPHABET.indexOf(b) !== -1 
        ? RUSSIAN_ALPHABET.indexOf(b) + 1000 
        : 9999;
    return indexA - indexB;
  });
}

export default function GlossaryView({ value }: GlossaryViewProps) {
  const t = useTranslations("glossary");
  const [glossaryWords, setGlossaryWords] = useState<GlossaryWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book");

  useEffect(() => {
    if (!bookId) {
      setIsLoading(false);
      return;
    }
    loadGlossary();
  }, [bookId]);

  const loadGlossary = async () => {
    if (!bookId) return;
    setIsLoading(true);
    const response = await getBookGlossary(bookId);
    if (response.success && response.data) {
      setGlossaryWords(response.data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 text-center text-gray-500">
        {t("loading")}
      </div>
    );
  }

  if (glossaryWords.length === 0) {
    return (
      <div className="w-full p-6 text-center text-gray-500">
        {t("empty")}
      </div>
    );
  }

  const groupedWords = groupWordsByLetter(glossaryWords);
  const letters = getAllLetters(groupedWords);

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">{t("title")}</h2>

      <div className="space-y-8">
        {letters.map((letter) => {
          const words = groupedWords.get(letter) || [];
          if (words.length === 0) return null;

          return (
            <div key={letter} className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                {letter}
              </h3>
              <ul className="space-y-1 list-none">
                {words.map((word) => (
                  <li key={word.id} className="text-gray-700">
                    <span className="font-medium">{word.word}</span>
                    {" - "}
                    <span className="text-gray-600">{word.translation}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
