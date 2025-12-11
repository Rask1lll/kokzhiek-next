import { Block } from "./block";
import { Book } from "./book";
import { Chapter } from "./chapter";

export type ConstructorState = {
  book: Book;
  current_chapter: Chapter;
  blocks: Block[];
  available_widget_types: string[];
};
