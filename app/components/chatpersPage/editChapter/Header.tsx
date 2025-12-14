"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";

export default function ChapterHeader() {
  const param = useSearchParams();
  const path = usePathname();
  const bookId = param.get("book");
  const chapter = param.get("chapter");
  const isEdit = param.get("edit");
  return (
    <div className="w-full z-50 py-5 bg-gray-100 border-b border-gray-400 flex items-center justify-center fixed top-0 left-0">
      <div className="w-5/6 flex justify-between">
        <Link
          className="p-2 gap-3 text-gray-700 font-semibold bg-blue-200 items-center flex rounded-lg"
          href={`/books/book?book=${bookId}`}
        >
          <BiArrowBack />
          <span>Назад</span>
        </Link>
        <div className="flex gap-1 items-center p-1 rounded-lg border text-sm border-blue-200">
          <Link
            href={`${path}?chapter=${chapter}&book=${bookId}&edit=1`}
            className={`${
              isEdit ? "bg-sky-300" : "bg-gray-200"
            } rounded-xl p-3`}
          >
            Редактирование
          </Link>
          <Link
            className={`${
              !isEdit ? "bg-sky-300" : "bg-gray-200"
            } rounded-xl p-3`}
            href={`${path}?chapter=${chapter}&book=${bookId}`}
          >
            Предпросмотр
          </Link>
        </div>
      </div>
    </div>
  );
}
