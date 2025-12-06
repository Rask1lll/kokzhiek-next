import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import { MdMenuBook } from "react-icons/md";

type ChapterCardProps = {
  id: string;
  title: string;
};

export default function ChapterCard({ id, title }: ChapterCardProps) {
  return (
    <Link
      href={`/books/chapter?id=${id}`}
      className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-50/60"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
          <MdMenuBook />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {title}
          </p>
        </div>
      </div>

      <FiChevronRight className="h-4 w-4 text-gray-400" />
    </Link>
  );
}
