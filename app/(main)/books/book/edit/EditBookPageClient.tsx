"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useBooks } from "@/app/hooks/useBooks";
import { Book } from "@/app/types/book";
import { UpdateBookPayload } from "@/app/types/UpdateBookPayload";
import { Subject } from "@/app/types/subject";
import { fetchSubjects } from "@/app/services/subjectsApi";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

const LANGUAGE_OPTIONS = [
  { code: "kk", label: "Қазақ тілі" },
  { code: "ru", label: "Русский" },
  { code: "en", label: "English" },
];

export default function EditBookPageClient() {
  const t = useTranslations("editBook");
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get("book");
  const { getBook, editBook } = useBooks();

  const DIFFICULTY_OPTIONS = [
    { value: "Начальный", label: t("difficultyBeginner") },
    { value: "Средний", label: t("difficultyIntermediate") },
    { value: "Продвинутый", label: t("difficultyAdvanced") },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("kk");
  const [subjectId, setSubjectId] = useState<number | null>(null);
  const [gradeId, setGradeId] = useState<number>(1);
  const [isbn, setIsbn] = useState("");
  const [year, setYear] = useState<number | undefined>();
  const [edition, setEdition] = useState("");
  const [difficulty, setDifficulty] = useState("Начальный");

  useEffect(() => {
    async function loadSubjects() {
      setSubjectsLoading(true);
      const response = await fetchSubjects();
      if (response?.data) {
        setSubjects(response.data);
      }
      setSubjectsLoading(false);
    }
    loadSubjects();
  }, []);

  useEffect(() => {
    if (!bookId) return;

    async function loadBook() {
      setIsLoading(true);
      const book = await getBook(Number(bookId));
      if (book) {
        setTitle(book.title || "");
        setAuthor(book.settings?.author || "");
        setDescription(book.description || "");
        setLanguage(book.language || "kk");
        setSubjectId(book.subject?.id ?? null);
        setGradeId(book.grade?.id ?? 1);
        setIsbn(book.publication?.isbn || "");
        setYear(book.publication?.year ?? undefined);
        setEdition(book.publication?.edition || "");
        setDifficulty(book.settings?.difficulty || "Начальный");
      }
      setIsLoading(false);
    }
    loadBook();
  }, []);
  // }, [bookId, getBook]); // хз иишка поставил его так я убрал

  const handleSave = async () => {
    if (!bookId) return;

    setErrors({});
    setGeneralError(null);
    setIsSaving(true);

    const payload: UpdateBookPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      language,
      subject_id: subjectId ?? undefined,
      grade_id: gradeId,
      isbn: isbn.trim() || undefined,
      year: year || undefined,
      edition: edition.trim() || undefined,
      settings: {
        author: author.trim() || undefined,
        difficulty,
      },
    };

    const result = await editBook(Number(bookId), payload);
    setIsSaving(false);

    if (result.success) {
      router.push(`/books/book?book=${bookId}`);
    } else {
      setErrors(result.errors);
      setGeneralError(result.message);
    }
  };

  const getFieldError = (field: string) => errors[field]?.[0];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/books/book?book=${bookId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>{t("backToBook")}</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-8 py-6 border-b bg-gray-50">
            <h1 className="text-2xl font-semibold text-gray-900">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t("subtitle")}
            </p>
          </div>

          <div className="px-8 py-6 space-y-6">
            {generalError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-600">{generalError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t("bookTitle")}
                </label>
                <input
                  type="text"
                  placeholder={t("bookTitlePlaceholder")}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    getFieldError("title")
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {getFieldError("title") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("title")}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t("author")}
                </label>
                <input
                  type="text"
                  placeholder={t("authorPlaceholder")}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>
            </div>

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
                  value={gradeId}
                  onChange={(e) => setGradeId(Number(e.target.value))}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={5}>5</option>
                  <option value={9}>9</option>
                  <option value={11}>11</option>
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
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t("description")}
              </label>
              <textarea
                rows={4}
                placeholder={t("descriptionPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

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
                  type="text"
                  placeholder={t("isbnPlaceholder")}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    getFieldError("isbn")
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                />
                {getFieldError("isbn") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("isbn")}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  {t("year")}
                </label>
                <input
                  type="number"
                  placeholder={t("yearPlaceholder")}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    getFieldError("year")
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  value={year || ""}
                  onChange={(e) =>
                    setYear(e.target.value ? Number(e.target.value) : undefined)
                  }
                />
                {getFieldError("year") && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError("year")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                {t("edition")}
              </label>
              <input
                type="text"
                placeholder={t("editionPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
              />
            </div>
          </div>

          <div className="px-8 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
            <Link
              href={`/books/book?book=${bookId}`}
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t("cancel")}
            </Link>
            <button
              type="button"
              disabled={isSaving || !title.trim()}
              className="inline-flex justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSave}
            >
              {isSaving ? t("saving") : t("save")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
