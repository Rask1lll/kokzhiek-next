"use client";

import { useState, ChangeEvent } from "react";

const SUBJECT_ID_MAP: Record<string, number> = {
  Математика: 1,
  Физика: 2,
  История: 3,
  Информатика: 4,
};

const LANGUAGE_CODE_MAP: Record<string, "kk" | "ru" | "en"> = {
  "Қазақ тілі": "kk",
  Русский: "ru",
  English: "en",
};

export default function CreateBookModal() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("Математика");
  const [grade, setGrade] = useState("1");
  const [language, setLanguage] = useState("Қазақ тілі");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Начальный");
  const [isbn, setIsbn] = useState("");
  const [, setCoverFile] = useState<File | null>(null);

  const handleCoverChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setCoverFile(file);
  };

  const handleCreateBook = async () => {
    if (!title.trim()) {
      console.error("Название книги обязательно");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token is missing");
      return;
    }

    const languageCode = LANGUAGE_CODE_MAP[language] ?? "kk";

    const gradeId = grade ? Number(grade) : undefined;

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      language: languageCode,
      grade_id: gradeId,
      isbn: isbn.trim() || undefined,
      settings: {
        author: author.trim() || undefined,
        difficulty,
      },
    };

    const data = JSON.stringify(payload);

    console.log(data);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books`,
        {
          headers: {
            "Content-type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          body: data,
        }
      );

      const resData = await res.json();
      console.log("Create book data:", resData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-white rounded-xl w-full max-w-3xl max-h-[70vh] flex flex-col overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-8 py-6 border-b bg-gray-50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Создать новую книгу
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Заполните основную информацию о книге. Это можно будет изменить
              позже.
            </p>
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
              Название книги *
            </label>
            <input
              type="text"
              placeholder="Введите название книги"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Автор *
            </label>
            <input
              type="text"
              placeholder="Имя автора"
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
              Обложка книги
            </label>
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Загрузите обложку
                </p>
                <p className="text-xs text-gray-500">JPG, PNG, до 5&nbsp;МБ</p>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">
                  <span>Выбрать файл</span>
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
            <div className="h-40 w-28 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-xs text-gray-400">
              Превью обложки
            </div>
          </div>
        </div>

        {/* Вторая строка: Предмет, Класс, Язык */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Предмет *
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Математика">Математика</option>
              <option value="Физика">Физика</option>
              <option value="История">История</option>
              <option value="Информатика">Информатика</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Класс *
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="5">5</option>
              <option value="9">9</option>
              <option value="11">11</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Язык *
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
            Описание
          </label>
          <textarea
            rows={4}
            placeholder="Кратко опишите содержание книги"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Сложность / часы / ISBN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Уровень сложности
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="Начальный">Начальный</option>
              <option value="Средний">Средний</option>
              <option value="Продвинутый">Продвинутый</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              ISBN (необязательно)
            </label>
            <input
              type="text"
              placeholder="978-0-123456-78-9"
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
          Создать книгу
        </button>
      </div>
    </div>
  );
}
