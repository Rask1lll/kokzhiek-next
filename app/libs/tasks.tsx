"use client";

import {
  FiCheckSquare,
  FiCircle,
  FiChevronDown,
  FiEdit3,
  FiImage,
  FiLink,
  FiGrid,
  FiMove,
  FiTarget,
  FiLayers,
  FiList,
  FiHash,
} from "react-icons/fi";

export const tasks = [
  {
    type: "multiple_choice",
    title: "Несколько из списка",
    description: "Выбор одного или нескольких правильных ответов с галочками",
    icon: <FiCheckSquare className="w-5 h-5 text-blue-500" />,
  },
  {
    type: "single_choice",
    title: "Один из списка",
    description: "Выбор одного правильного ответа из предложенных вариантов",
    icon: <FiCircle className="w-5 h-5 text-indigo-500" />,
  },
  {
    type: "dropdown",
    title: "Раскрывающийся список",
    description: "Выбор одного ответа из выпадающего меню",
    icon: <FiChevronDown className="w-5 h-5 text-violet-500" />,
  },
  {
    type: "fill_blank",
    title: "Пропуск",
    description: "Ввод текста в пропущенное место",
    icon: <FiEdit3 className="w-5 h-5 text-sky-500" />,
  },
  {
    type: "elements_on_image",
    title: "Элементы на изображении",
    description: "Размещение интерактивных элементов поверх изображения",
    icon: <FiImage className="w-5 h-5 text-pink-500" />,
  },
  {
    type: "match_pairs",
    title: "Соедините пары",
    description: "Перетаскивание вариантов в соответствующие ячейки",
    icon: <FiLink className="w-5 h-5 text-emerald-500" />,
  },
  {
    type: "concept_map",
    title: "Карта понятий",
    description: "Таблица с возможностью рисовать стрелки между ячейками",
    icon: <FiGrid className="w-5 h-5 text-teal-500" />,
  },
  {
    type: "drag_drop",
    title: "Перетаскивание",
    description: "Перетаскивание вариантов ответов в правильные точки",
    icon: <FiMove className="w-5 h-5 text-orange-500" />,
  },
  {
    type: "drag_to_image",
    title: "Перетащить на изображение",
    description: "Перетаскивание кружков с номерами на изображение",
    icon: <FiTarget className="w-5 h-5 text-red-500" />,
  },
  {
    type: "sort",
    title: "Сортировать",
    description: "Распределение ответов по группам (колонкам)",
    icon: <FiLayers className="w-5 h-5 text-amber-500" />,
  },
  {
    type: "order",
    title: "Упорядочить",
    description: "Расположение ответов в правильном порядке",
    icon: <FiList className="w-5 h-5 text-lime-500" />,
  },
  {
    type: "word_search",
    title: "Сетка букв",
    description: "Поиск слов в сетке букв",
    icon: <FiHash className="w-5 h-5 text-cyan-500" />,
  },
  {
    type: "crossword",
    title: "Кроссворд",
    description: "Разгадывание кроссворда по определениям",
    icon: <FiGrid className="w-5 h-5 text-purple-500" />,
  },
];

export type TaskType = (typeof tasks)[number]["type"];
