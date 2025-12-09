import {
  FiType,
  FiUnderline,
  FiAlignLeft,
  FiImage,
  FiGrid,
  FiVideo,
  FiMusic,
  FiCode,
  FiMinus,
  FiShare2,
} from "react-icons/fi";

export const widgets = [
  {
    type: "heading",
    title: "Заголовок",
    description: "Крупный заголовок для начала блока или раздела",
    icon: <FiType className="w-5 h-5 text-blue-500" />,
  },
  {
    type: "subheading",
    title: "Подзаголовок",
    description: "Подзаголовок для структурирования текста",
    icon: <FiUnderline className="w-5 h-5 text-indigo-500" />,
  },
  {
    type: "text",
    title: "Текст",
    description: "Обычный параграф текста",
    icon: <FiAlignLeft className="w-5 h-5 text-sky-500" />,
  },
  {
    type: "quote",
    title: "Цитата",
    description: "Выделенная цитата или важная мысль",
    icon: <FiAlignLeft className="w-5 h-5 text-emerald-500" />,
  },
  {
    type: "list",
    title: "Список",
    description: "Маркированный или нумерованный список",
    icon: <FiAlignLeft className="w-5 h-5 text-amber-500" />,
  },
  {
    type: "image",
    title: "Фото",
    description: "Изображение или иллюстрация",
    icon: <FiImage className="w-5 h-5 text-pink-500" />,
  },
  {
    type: "video",
    title: "Видео",
    description: "Встроенный видеоролик",
    icon: <FiVideo className="w-5 h-5 text-red-500" />,
  },
  {
    type: "audio",
    title: "Аудио",
    description: "Аудиозапись, подкаст или музыка",
    icon: <FiMusic className="w-5 h-5 text-teal-500" />,
  },
  {
    type: "formula",
    title: "Формула",
    description: "Математическая формула в формате LaTeX",
    icon: <FiCode className="w-5 h-5 text-emerald-600" />,
  },
  {
    type: "divider",
    title: "Разделитель",
    description: "Тонкая линия для разделения смысловых блоков",
    icon: <FiMinus className="w-5 h-5 text-gray-400" />,
  },
];

type WidgetListModalProps = {
  onSelect?: (type: string) => void;
};

export default function WidgetListModal({ onSelect }: WidgetListModalProps) {
  return (
    <div className="w-full max-w-xl bg-white rounded-xl p-4 sm:p-6 space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
        Выберите тип виджета
      </h2>
      <p className="text-sm text-gray-500">
        Эти элементы можно будет добавлять внутрь выбранного блока. Сейчас это
        просто список вариантов.
      </p>
      <div className="mt-2 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {widgets.map((widget) => (
          <div
            key={widget.type}
            onClick={() => onSelect?.(widget.type)}
            className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-2 sm:px-4 sm:py-3 hover:border-blue-400 hover:bg-blue-50/60 cursor-pointer transition-colors duration-100"
          >
            <div className="mt-0.5 shrink-0">{widget.icon}</div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-800">
                {widget.title}
              </span>
              <span className="text-xs sm:text-sm text-gray-500">
                {widget.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
