import { getAuthHeaders } from "../../libs/auth";
import { Book } from "../../types/book";
import { ConstructorResponse } from "../../types/constructorResponse";
import { CreateBookPayload } from "../../types/CreateBookPayload";

export async function handleCreateBook(
  payload: CreateBookPayload
): Promise<ConstructorResponse<Book> | undefined> {
  const data = JSON.stringify(payload);

  console.log(data);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books`,
      {
        headers: getAuthHeaders(),
        method: "POST",
        body: data,
      }
    );

    return res.json();
  } catch (error) {
    console.error(error);
  }
}

export async function handleGetBooks(): Promise<
  ConstructorResponse<Book[]> | undefined
> {
  try {
    const data = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books`,
      {
        headers: getAuthHeaders(),
      }
    );
    return data.json();
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}
