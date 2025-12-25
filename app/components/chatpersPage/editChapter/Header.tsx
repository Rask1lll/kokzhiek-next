"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";
import { FiDownload } from "react-icons/fi";

export default function ChapterHeader() {
  const param = useSearchParams();
  const path = usePathname();
  const bookId = param.get("book");
  const chapter = param.get("chapter");
  const isEdit = param.get("edit");

  const handleSaveAsPdf = () => {
    const header = document.querySelector("header");
    if (header) {
      header.style.display = "none";
    }
    window.print();
    if (header) {
      header.style.display = "";
    }
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-14 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="mx-auto h-full w-5/6 flex items-center justify-between">
        <Link
          href={`/books/book?book=${bookId}`}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition"
        >
          <BiArrowBack className="text-lg" />
          <span>Назад</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveAsPdf}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition text-sm"
          >
            <FiDownload className="text-base" />
            <span>Сохранить как PDF</span>
          </button>

          <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 p-1 text-sm">
            <Link
              href={`${path}?chapter=${chapter}&book=${bookId}&edit=1`}
              className={`px-4 py-1.5 rounded-md transition ${
                isEdit
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Редактирование
            </Link>

            <Link
              href={`${path}?chapter=${chapter}&book=${bookId}`}
              className={`px-4 py-1.5 rounded-md transition ${
                !isEdit
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Предпросмотр
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
