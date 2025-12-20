export type ValidationErrorResponse = {
  message: string;
  errors: Record<string, string[]>;
};
