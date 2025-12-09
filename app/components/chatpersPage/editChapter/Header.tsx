"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BiArrowBack } from "react-icons/bi";

export default function ChapterHeader() {
  const param = useSearchParams();
  const bookId = param.get("book");
  return (
    <div className="w-full z-50 py-5 bg-gray-100 border-b border-gray-400 flex items-center justify-center fixed top-0 left-0">
      <div className="w-5/6">
        <button className="">
          <Link
            className="p-2 gap-3 text-gray-700 font-semibold bg-blue-200 items-center flex rounded-lg"
            href={`/books/book?book=${bookId}`}
          >
            <BiArrowBack />
            <span>Назад</span>
          </Link>
        </button>
      </div>
    </div>
  );
}
