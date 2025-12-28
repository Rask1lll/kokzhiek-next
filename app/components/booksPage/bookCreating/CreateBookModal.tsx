"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { useModalWindowStore } from "@/app/store/modalWindowStore";
import { CreateBookPayload } from "@/app/types/CreateBookPayload";
import { useBooks } from "@/app/hooks/useBooks";
import { Subject } from "@/app/types/subject";
import { fetchSubjects } from "@/app/services/subjectsApi";

const LANGUAGE_CODE_MAP: Record<string, "kk" | "ru" | "en"> = {
  "Қазақ тілі": "kk",
  Русский: "ru",
  English: "en",
};

export default function CreateBookModal() {
  const t = useTranslations("createBookModal");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [grade, setGrade] = useState("1");
  const [language, setLanguage] = useState("Қазақ тілі");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Начальный");
  const [isbn, setIsbn] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const { createBook } = useBooks();
  const { removeContent } = useModalWindowStore();

  const DIFFICULTY_OPTIONS = [
    { value: "Начальный", label: t("difficultyBeginner") },
    { value: "Средний", label: t("difficultyIntermediate") },
    { value: "Продвинутый", label: t("difficultyAdvanced") },
  ];

  useEffect(() => {
    async function loadSubjects() {
      setSubjectsLoading(true);

      const response = await fetchSubjects();
      if (response?.data) {
        setSubjects(response.data);
        if (response.data.length > 0) {
          setSubjectId(response.data[0].id);
        }
      }

      setSubjectsLoading(false);
    }
    loadSubjects();
  }, []);

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setCoverFile(file);

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }

    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(null);
    }
  };
  function handleCreateBook() {
    const languageCode = LANGUAGE_CODE_MAP[language] ?? "kk";

    const gradeId = grade ? Number(grade) : undefined;

    const payload: CreateBookPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      language: languageCode || undefined,
      grade_id: gradeId || undefined,
      subject_id: subjectId ?? undefined,
      isbn: isbn.trim() || undefined,
      cover: coverFile || undefined,
      settings: {
        author: author.trim() || undefined,
        difficulty,
      },
    };

    createBook(payload);
    removeContent();
  }

  return (
    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[70vh] flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-8 py-6 border-b bg-gray-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {t("title")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
          </div>
          <span className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500"></span>
        </div>
      </div>

      {/* Content / Form */}
      <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
        {/* Первая строка: Название + Автор */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {t("bookTitle")}
            </label>
            <input
              spellCheck
              type="text"
              placeholder={t("bookTitlePlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {t("author")}
            </label>
            <input
              spellCheck
              type="text"
              placeholder={t("authorPlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
        </div>

        {/* Обложка книги */}
        <div className="grid grid-cols-1 md:grid-cols-[180px,1fr] gap-4 items-start">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {t("coverImage")}
            </label>
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  {t("uploadCover")}
                </p>
                <p className="text-xs text-gray-500">{t("coverHint")}</p>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">
                  <span>{t("selectFile")}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt={t("coverPreview")}
                className="h-40 w-28 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="h-40 w-28 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
                {t("coverPreview")}
              </div>
            )}
          </div>
        </div>

        {/* Вторая строка: Предмет, Класс, Язык */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {t("subject")}
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={subjectId ?? ""}
              onChange={(e) => setSubjectId(Number(e.target.value))}
              disabled={subjectsLoading}
            >
              {subjectsLoading ? (
                <option value="">{t("loadingSubjects")}</option>
              ) : subjects.length === 0 ? (
                <option value="">{t("noSubjects")}</option>
              ) : (
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_ru}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {t("grade")}
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {t("language")}
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="Қазақ тілі">Қазақ тілі</option>
              <option value="Русский">Русский</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>

        {/* Описание */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            {t("description")}
          </label>
          <textarea
            rows={4}
            spellCheck
            placeholder={t("descriptionPlaceholder")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Сложность / часы / ISBN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {t("difficulty")}
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {DIFFICULTY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {t("isbn")}
            </label>
            <input
              spellCheck
              type="text"
              placeholder={t("isbnPlaceholder")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
            />
          </div>
        </div>

        {/* Теги */}
      </div>

      {/* Footer */}
      <div className="px-8 py-4 border-t bg-gray-50 flex sm:flex-row items-stretch sm:items-center justify-end gap-3">
        <button
          type="button"
          className="w-full sm:w-auto inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          onClick={handleCreateBook}
        >
          {t("createButton")}
        </button>
      </div>
    </div>
  );
}
