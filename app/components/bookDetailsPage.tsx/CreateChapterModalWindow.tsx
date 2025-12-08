"use client";

import { useState, ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";

export default function CreateChapterModalWindow() {
  const [title, setTitle] = useState("");
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book");

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleCreateChapter = async () => {
    if (!bookId) {
      console.error("Book id is missing in search params");
      return;
    }

    if (!title.trim()) {
      console.error("Chapter title is empty");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token is missing");
      return;
    }

    const data = JSON.stringify({ title: title.trim() });

    console.log("Create chapter payload:", data);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/books/${bookId}/chapters`,
        {
          headers: {
            "Content-type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "POST",
          body: data,
        }
      );

      const resData = await res.json();
      console.log("Create chapter response:", resData);
    } catch (error) {
      console.error("Failed to create chapter:", error);
    }
  };
  return (
    <div className=" bg-white md:w-xs lg:w-md rounded-2xl pb-4">
      <h1 className="border-b p-5 border-gray-300 ">Создание новой главы</h1>
      <div className="py-4 p-2">
        <input
          type="text"
          placeholder="Название главы"
          className="w-full ring-1 p-2 rounded-md"
          value={title}
          onChange={handleTitleChange}
        />
      </div>
      <div className="w-full flex justify-end mt-3 px-4">
        <button
          type="button"
          onClick={handleCreateChapter}
          className="bg-sky-500/40 p-4 py-2 rounded-lg border-2 border-blue-400 cursor-pointer"
        >
          Создать
        </button>
      </div>
    </div>
  );
}
