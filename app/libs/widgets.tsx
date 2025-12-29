import {
  FiType,
  FiUnderline,
  FiAlignLeft,
  FiImage,
  FiVideo,
  FiMusic,
  FiCode,
  FiMinus,
  FiGlobe,
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
  {
    type: "embed",
    title: "Встраивание",
    description: "Встраивание внешнего контента через iframe",
    icon: <FiGlobe className="w-5 h-5 text-cyan-500" />,
  },
];
