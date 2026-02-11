import { Block } from "./block";
import { Book } from "./book";
import { Chapter } from "./chapter";

export type ConstructorState = {
  book: Book;
  current_chapter: Chapter;
  prev_chapter: Chapter | null;
  next_chapter: Chapter | null;
  blocks: Block[];
  available_widget_types: string[];
};
