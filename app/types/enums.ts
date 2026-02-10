// Типы заданий (tasks)
export enum TaskType {
  MULTIPLE_CHOICE = "multiple_choice",
  SINGLE_CHOICE = "single_choice",
  DROPDOWN = "dropdown",
  FILL_BLANK = "fill_blank",
  MATCH_PAIRS = "match_pairs",
  CONCEPT_MAP = "concept_map",
  DRAG_DROP = "drag_drop",
  SORT = "sort",
  ORDER = "order",
  SENTENCE_ORDER = "sentence_order",
  WORD_SEARCH = "word_search",
  CROSSWORD = "crossword",
}

// Типы виджетов (widgets)
export enum WidgetType {
  HEADING = "heading",
  SUBHEADING = "subheading",
  TEXT = "text",
  GLOSSARY_TEXT = "glossary_text",
  GLOSSARY = "glossary",
  QUOTE = "quote",
  LIST = "list",
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
  FORMULA = "formula",
  DIVIDER = "divider",
  EMBED = "embed",
  BANNER = "banner",
}

// Общий тип блока (задание или виджет)
export type BlockType = TaskType | WidgetType;
