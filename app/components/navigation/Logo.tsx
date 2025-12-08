import Link from "next/link";

export default function Logo() {
  return (
    <div className="flex items-center">
      <Link href="/books" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">📚</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900">Көкжиек-Горизонт</h1>
        </div>
      </Link>
    </div>
  );
}
