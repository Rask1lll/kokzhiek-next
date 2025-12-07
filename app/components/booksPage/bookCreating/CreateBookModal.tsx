export default function CreateBookModal() {
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
                  <input type="file" accept="image/*" className="hidden" />
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
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Математика</option>
              <option>Физика</option>
              <option>История</option>
              <option>Информатика</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Класс *
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>1</option>
              <option>2</option>
              <option>5</option>
              <option>9</option>
              <option>11</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Язык *
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Қазақ тілі</option>
              <option>Русский</option>
              <option>English</option>
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
          />
        </div>

        {/* Сложность / часы / ISBN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Уровень сложности
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Начальный</option>
              <option>Средний</option>
              <option>Продвинутый</option>
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
        >
          Создать книгу
        </button>
      </div>
    </div>
  );
}
