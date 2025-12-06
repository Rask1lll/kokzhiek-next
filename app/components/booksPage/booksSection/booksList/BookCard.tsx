import Image from "next/image";
import Link from "next/link";

export default function BookCard({ bookId }: { bookId: string }) {
  return (
    <div className="relative group">
      <Link
        href={`/books/book?id=${bookId}`}
        className="block bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer overflow-hidden"
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
            Название книги
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            Краткое описание книги.
          </p>
          <div className="absolute bottom-2 right-4 text-xs text-gray-500">
            11 класс
          </div>
        </div>
      </Link>

      <button
        type="button"
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:bg-red-600"
      >
        удалить
      </button>
    </div>
  );
}
