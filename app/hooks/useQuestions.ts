import { useCallback, useState, useEffect } from "react";
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  uploadOptionImage,
  deleteOptionImage,
} from "@/app/services/constructor/questionsApi";
import {
  Question,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  ReorderQuestionsPayload,
} from "@/app/types/question";

export function useQuestions(widgetId: number | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load questions for widget
  const loadQuestions = useCallback(async () => {
    if (!widgetId) {
      setQuestions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getQuestions(widgetId);
      if (response.success && response.data) {
        // Load full details for each question
        const fullQuestions = await Promise.all(
          response.data.map(async (question) => {
            if (question.id) {
              try {
                const fullResponse = await getQuestion(question.id);
                if (fullResponse.success && fullResponse.data) {
                  return fullResponse.data;
                }
              } catch (err) {
                console.error(`Failed to load question ${question.id}:`, err);
              }
            }
            return question;
          })
        );
        setQuestions(fullQuestions);
        console.log(fullQuestions);
      } else {
        setError(response.messages?.[0] || "Failed to load questions");
        setQuestions([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [widgetId]);

  // Load questions on mount and when widgetId changes
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Create a new question
  const create = useCallback(
    async (payload: CreateQuestionPayload): Promise<Question | null> => {
      if (!widgetId) return null;

      setLoading(true);
      setError(null);
      try {
        const response = await createQuestion(widgetId, payload);
        if (response.success && response.data) {
          const newQuestion = response.data;
          // Load full question details
          if (newQuestion.id) {
            try {
              const fullResponse = await getQuestion(newQuestion.id);
              if (fullResponse.success && fullResponse.data) {
                const fullQuestion = fullResponse.data;
                setQuestions((prev) => [...prev, fullQuestion]);
                return fullQuestion;
              }
            } catch (err) {
              console.error(
                `Failed to load full question ${newQuestion.id}:`,
                err
              );
            }
          }
          setQuestions((prev) => [...prev, newQuestion]);
          return newQuestion;
        } else {
          setError(response.messages?.[0] || "Failed to create question");
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [widgetId]
  );

  // Update a question
  const update = useCallback(
    async (
      questionId: number,
      payload: UpdateQuestionPayload
    ): Promise<Question | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await updateQuestion(questionId, payload);
        if (response.success && response.data) {
          const updatedQuestion = response.data;
          // Load full question details after update
          try {
            const fullResponse = await getQuestion(questionId);
            if (fullResponse.success && fullResponse.data) {
              const fullQuestion = fullResponse.data;
              setQuestions((prev) =>
                prev.map((q) => (q.id === questionId ? fullQuestion : q))
              );
              return fullQuestion;
            }
          } catch (err) {
            console.error(`Failed to load full question ${questionId}:`, err);
          }
          setQuestions((prev) =>
            prev.map((q) => (q.id === questionId ? updatedQuestion : q))
          );
          return updatedQuestion;
        } else {
          setError(response.messages?.[0] || "Failed to update question");
          return null;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a question
  const remove = useCallback(async (questionId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reorder questions
  const reorder = useCallback(
    async (payload: ReorderQuestionsPayload): Promise<boolean> => {
      if (!widgetId) return false;

      setLoading(true);
      setError(null);
      try {
        const response = await reorderQuestions(widgetId, payload);
        if (response.success && response.data) {
          setQuestions(response.data);
          return true;
        } else {
          setError(response.messages?.[0] || "Failed to reorder questions");
          return false;
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [widgetId]
  );

  // Upload image for option
  const uploadImage = useCallback(
    async (optionId: number, file: File): Promise<string | null> => {
      try {
        const response = await uploadOptionImage(optionId, file);
        if (response.success && response.data) {
          // Update the question in local state
          const question = questions.find((q) =>
            q.options?.some((opt) => opt.id === optionId)
          );
          if (question) {
            await loadQuestions(); // Reload to get updated data
          }
          return response.data.image_url;
        }
        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return null;
      }
    },
    [questions, loadQuestions]
  );

  // Delete image from option
  const removeImage = useCallback(
    async (optionId: number): Promise<boolean> => {
      try {
        const response = await deleteOptionImage(optionId);
        if (response.success) {
          await loadQuestions(); // Reload to get updated data
          return true;
        }
        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        return false;
      }
    },
    [loadQuestions]
  );

  return {
    questions,
    loading,
    error,
    loadQuestions,
    create,
    update,
    remove,
    reorder,
    uploadImage,
    removeImage,
  };
}
