import { useCallback, useEffect, useRef, useState } from "react";
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  uploadOptionImage,
  deleteOptionImage,
  uploadQuestionImage,
  deleteQuestionImage,
  uploadSignImage,
  deleteSignImage,
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

  const loadedRef = useRef(false);

  /** LOAD — ТОЛЬКО ОДИН РАЗ НА widgetId */
  const loadQuestions = useCallback(async () => {
    if (!widgetId) {
      setQuestions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getQuestions(widgetId);
      if (res.success) {
        setQuestions(res.data);
      } else {
        setError(res.messages?.[0] ?? "Failed to load questions");
      }
    } catch {
      setError("Failed to load questions");
    } finally {
      setLoading(false);
    }
  }, [widgetId]);

  useEffect(() => {
    loadedRef.current = false;
  }, [widgetId]);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    loadQuestions();
  }, [loadQuestions]);

  // Listen for cross-instance invalidation events
  useEffect(() => {
    if (typeof window === "undefined" || !widgetId) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.widgetId === widgetId) {
        loadedRef.current = false;
        loadQuestions();
      }
    };
    window.addEventListener("questionsInvalidated", handler);
    return () => window.removeEventListener("questionsInvalidated", handler);
  }, [widgetId, loadQuestions]);

  /** CREATE */
  const create = useCallback(
    async (payload: CreateQuestionPayload) => {
      if (!widgetId) return null;

      const res = await createQuestion(widgetId, payload);
      if (res.success) {
        setQuestions((prev) => [...prev, res.data]);
        return res.data;
      }

      setError(res.messages?.[0] ?? "Create failed");
      return null;
    },
    [widgetId]
  );

  /** UPDATE */
  const update = useCallback(
    async (id: number, payload: UpdateQuestionPayload) => {
      const res = await updateQuestion(id, payload);
      if (res.success) {
        setQuestions((prev) => prev.map((q) => (q.id === id ? res.data : q)));
        return res.data;
      }

      setError(res.messages?.[0] ?? "Update failed");
      return null;
    },
    []
  );

  /** DELETE */
  const remove = useCallback(async (id: number) => {
    await deleteQuestion(id);
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    return true;
  }, []);

  /** REORDER */
  const reorder = useCallback(
    async (payload: ReorderQuestionsPayload) => {
      if (!widgetId) return false;

      const res = await reorderQuestions(widgetId, payload);
      if (res.success) {
        setQuestions(res.data);
        return true;
      }

      setError(res.messages?.[0] ?? "Reorder failed");
      return false;
    },
    [widgetId]
  );

  /** IMAGE UPLOAD — ЛОКАЛЬНО */
  const uploadImage = useCallback(async (optionId: number, file: File) => {
    const res = await uploadOptionImage(optionId, file);
    if (!res.success) return null;

    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        options: q.options?.map((o) =>
          o.id === optionId ? res.data.option : o
        ),
      }))
    );

    return res.data.image_url;
  }, []);

  /** IMAGE DELETE — ЛОКАЛЬНО */
  const removeImage = useCallback(async (optionId: number) => {
    const res = await deleteOptionImage(optionId);
    if (!res.success) return false;

    setQuestions((prev) =>
      prev.map((q) => ({
        ...q,
        options: q.options?.map((o) => (o.id === optionId ? res.data : o)),
      }))
    );

    return true;
  }, []);

  /** QUESTION IMAGE UPLOAD */
  const uploadQuestionImageFn = useCallback(
    async (questionId: number, file: File): Promise<string | null> => {
      const res = await uploadQuestionImage(questionId, file);
      if (!res.success) return null;

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? res.data.question : q))
      );

      return res.data.image_url;
    },
    []
  );

  /** QUESTION IMAGE DELETE */
  const removeQuestionImage = useCallback(
    async (questionId: number): Promise<boolean> => {
      const res = await deleteQuestionImage(questionId);
      if (!res.success) return false;

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? res.data : q))
      );

      return true;
    },
    []
  );

  /** SIGN IMAGE UPLOAD */
  const uploadSign = useCallback(
    async (questionId: number, file: File): Promise<string | null> => {
      const res = await uploadSignImage(questionId, file);
      if (!res.success) return null;

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? res.data.question : q))
      );

      return res.data.sign_url;
    },
    []
  );

  /** SIGN IMAGE DELETE */
  const removeSign = useCallback(
    async (questionId: number): Promise<boolean> => {
      const res = await deleteSignImage(questionId);
      if (!res.success) return false;

      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? res.data : q))
      );

      return true;
    },
    []
  );

  return {
    questions,
    loading,
    error,
    reload: loadQuestions,
    create,
    update,
    remove,
    reorder,
    uploadImage,
    removeImage,
    uploadQuestionImage: uploadQuestionImageFn,
    removeQuestionImage,
    uploadSign,
    removeSign,
  };
}
