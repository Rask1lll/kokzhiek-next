import { useCallback } from "react";
import {
  handleCreateBook,
  handleDeleteBook,
  handleGetBook,
  handleGetBooks,
  handleUpdateBook,
} from "../services/book/booksApi";
import { useBooksStore } from "../store/booksStore";
import { Book } from "../types/book";
import { ConstructorResponse } from "../types/constructorResponse";
import { CreateBookPayload } from "../types/CreateBookPayload";
import { UpdateBookPayload } from "../types/UpdateBookPayload";

export function useBooks() {
  const { addBook, updateBook, setBooks, setIsLoading, isLoading } = useBooksStore();

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
    await getBooks();

    return true;
  };

  const getBook = async (bookId: number) => {
    const resData = await handleGetBook(bookId);
    if (!resData || !resData.success) {
      return null;
    }
    return resData.data;
  };

  const editBook = async (bookId: number, payload: UpdateBookPayload) => {
    const resData = await handleUpdateBook(bookId, payload);
    if (!resData || !resData.success) {
      return null;
    }
    updateBook(bookId, resData.data);
    return resData.data;
  };

  return { createBook, deleteBook, editBook, getBook, getBooks, isLoading };
}
