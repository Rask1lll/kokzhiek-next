import { useCallback } from "react";
import {
  handleCreateBook,
  handleDeleteBook,
  handleGetBooks,
} from "../services/book/booksApi";
import { useBooksStore } from "../store/booksStore";
import { Book } from "../types/book";
import { ConstructorResponse } from "../types/constructorResponse";
import { CreateBookPayload } from "../types/CreateBookPayload";

export function useBooks() {
  const { addBook, removeBook, setBooks, setIsLoading, isLoading } =
    useBooksStore();

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

  const deleteBook = async (bookId: number, bookTitle: string) => {
    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить книгу "${bookTitle}"?`
    );
    if (!confirmed) return false;

    const resData = await handleDeleteBook(bookId);
    if (!resData || !resData.success) {
      return false;
    }
    removeBook(bookId);
    return true;
  };

  return { createBook, deleteBook, getBooks, isLoading };
}
