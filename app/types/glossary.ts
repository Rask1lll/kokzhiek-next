export type GlossaryWord = {
  id: string;
  word: string;
  translation: string;
  language?: string;
  created_at?: string;
  updated_at?: string;
};

export type GlossaryTextWidgetData = {
  content: string; // HTML контент с разметкой слов
  wordIds: string[]; // Массив ID слов из book.glossary
};
