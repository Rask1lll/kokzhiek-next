import { useCallback } from "react";
import { handleCreateBook, handleGetBooks } from "../services/book/booksApi";
import { useBooksStore } from "../store/booksStore";
import { Book } from "../types/book";
import { ConstructorResponse } from "../types/constructorResponse";
import { CreateBookPayload } from "../types/CreateBookPayload";

export function useBooks() {
  const { addBook, setBooks, setIsLoading, isLoading } = useBooksStore();

  const getBooks = useCallback(async () => {
    setIsLoading(true);
    const resData: ConstructorResponse<Book[]> | undefined =
      await handleGetBooks();
    if (!resData || !resData.success) {
      setIsLoading(false);
      return;
    }
    setBooks(resData.data);
    setIsLoading(false);
    return resData;
  }, [setIsLoading, setBooks]);

  const createBook = async (payload: CreateBookPayload) => {
    setIsLoading(true);
    const resData: ConstructorResponse<Book> | undefined =
      await handleCreateBook(payload);
    if (!resData || !resData.success) {
      setIsLoading(false);
      return;
    }
    addBook(resData.data);
    setIsLoading(false);
    return resData;
  };

  return { createBook, getBooks, isLoading };
}
