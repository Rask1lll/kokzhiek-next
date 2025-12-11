export type ConstructorResponse<T> = {
  data: T;
  messages: string[];
  success: boolean;
};
