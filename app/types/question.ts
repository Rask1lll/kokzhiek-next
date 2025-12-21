import { TaskType } from "./enums";

export type QuestionOption = {
  id?: number;
  body: string;
  image_url?: string | null;
  is_correct: boolean;
  match_id?: string | null;
  group?: string | null;
  order: number;
  position?: number;
};

export type Question = {
  id?: number;
  type: TaskType | string;
  body: string;
  data?: Record<string, unknown>;
  points: number;
  order?: number;
  options?: QuestionOption[];
};

export type CreateQuestionPayload = {
  type: TaskType | string;
  body: string;
  data?: Record<string, unknown>;
  points: number;
  options: Omit<QuestionOption, "id" | "position">[];
};

export type UpdateQuestionPayload = {
  type?: TaskType | string;
  body?: string;
  data?: Record<string, unknown>;
  points?: number;
  options?: (QuestionOption | Omit<QuestionOption, "id" | "position">)[];
};

export type ReorderQuestionsPayload = {
  id: number;
  order: number;
}[];

