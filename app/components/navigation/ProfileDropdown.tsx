export default function ProfileDropdown() {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
      <a
        href="/settings"
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {/* Иконка настроек */}
        <span className="w-4 h-4 rounded-full bg-gray-300" />
        <span>Настройки</span>
      </a>

      <a
        href="/admin"
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        {/* Иконка щита */}
        <span className="w-4 h-4 rounded-full bg-gray-300" />
        <span>Админ панель</span>
      </a>

      <hr className="my-1" />

      <button
        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
        type="button"
      >
        {/* Иконка выхода */}
        <span className="w-4 h-4 rounded-full bg-red-300" />
        <span>Выйти</span>
      </button>
    </div>
  );
}
