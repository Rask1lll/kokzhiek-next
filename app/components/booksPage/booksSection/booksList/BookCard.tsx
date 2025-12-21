import Image from "next/image";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
import { ViewMode } from "../filters/BooksViewModeToggle";

type BookCardProps = {
  bookId: number;
  name: string;
  onDelete: (bookId: number, bookTitle: string) => void;
  viewMode?: ViewMode;
};

export default function BookCard({ bookId, name, onDelete, viewMode = "grid" }: BookCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(bookId, name);
  };

  if (viewMode === "list") {
    return (
      <div className="relative group w-full">
        <Link
          href={`/books/book?book=${bookId}`}
          className="block bg-white rounded-xl shadow-md hover:shadow-lg transform transition-all overflow-hidden cursor-pointer w-full"
        >
          <div className="flex items-center gap-4 p-4 w-full">
            <div className="relative w-20 h-28 shrink-0 overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
              <Image
                src="https://placehold.co/600x400@2x.png"
                alt="Название книги"
                width={80}
                height={112}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-base mb-1 line-clamp-1">
                  {name}
                </h3>
                <div className="text-xs text-gray-500">11 класс</div>
              </div>
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          className="absolute top-4 right-4 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-red-600 cursor-pointer z-10"
        >
          <MdDelete className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="hover:scale-102 duration-100 cursor-pointer">
        <Link
          href={`/books/book?book=${bookId}`}
          className="block bg-white rounded-xl shadow-lg hover:shadow-xl transform transition-all overflow-hidden cursor-pointer"
        >
          <div className="h-80 relative overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
            <Image
              src="https://placehold.co/600x400@2x.png"
              alt="Название книги"
              width={400}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 h-24 relative">
            <h3 className="font-semibold text-gray-800 text-lg mb-2 line-clamp-2">
              {name}
            </h3>

            <div className="absolute bottom-2 right-4 text-xs text-gray-500">
              11 класс
            </div>
          </div>
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-red-600 cursor-pointer"
        >
          <MdDelete className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
