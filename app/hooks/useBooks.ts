import { useCallback } from "react";
import {
  ApiResult,
  DuplicateBookPayload,
  GetBooksParams,
  handleCreateBook,
  handleDeleteBook,
  handleDeleteBookCover,
  handleDuplicateBook,
  handleGetBook,
  handleGetBooks,
  handleUpdateBook,
  handleUploadBookCover,
} from "../services/book/booksApi";
import { useBooksStore } from "../store/booksStore";
import { Book } from "../types/book";
import { ConstructorResponse } from "../types/constructorResponse";
import { CreateBookPayload } from "../types/CreateBookPayload";
import { UpdateBookPayload } from "../types/UpdateBookPayload";

export function useBooks() {
  const { addBook, updateBook, setBooks, setIsLoading, isLoading } = useBooksStore();

  const getBooks = useCallback(async (params?: GetBooksParams) => {
    setIsLoading(true);
    const resData: ConstructorResponse<Book[]> | undefined =
      await handleGetBooks(params);
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

  const editBook = async (
    bookId: number,
    payload: UpdateBookPayload
  ): Promise<ApiResult<Book>> => {
    const result = await handleUpdateBook(bookId, payload);
    if (result.success) {
      updateBook(bookId, result.data);
    }
    return result;
  };

  const uploadCover = async (
    bookId: number,
    file: File
  ): Promise<ApiResult<Book>> => {
    const result = await handleUploadBookCover(bookId, file);
    if (result.success) {
      updateBook(bookId, result.data);
    }
    return result;
  };

  const deleteCover = async (bookId: number): Promise<ApiResult<Book>> => {
    const result = await handleDeleteBookCover(bookId);
    if (result.success) {
      updateBook(bookId, result.data);
    }
    return result;
  };

  const duplicateBook = async (
    bookId: number,
    payload?: DuplicateBookPayload
  ): Promise<ApiResult<Book>> => {
    setIsLoading(true);
    const result = await handleDuplicateBook(bookId, payload);
    setIsLoading(false);
    return result;
  };

  return { createBook, deleteBook, deleteCover, duplicateBook, editBook, getBook, getBooks, isLoading, uploadCover };
}
