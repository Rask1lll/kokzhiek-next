"use client";

import { useCallback, useEffect, useState } from "react";
import { useBlocksStore } from "@/app/store/blocksStore";
import { getChapterState } from "@/app/services/constructor/constructorApi";

type UseConstructorOptions = {
  bookId: string | null;
  chapterId: string | null;
};

export function useConstructor({ bookId, chapterId }: UseConstructorOptions) {
  const { blocks, setBlocks, setChapterId, setAdjacentChapters, clearBlocks } = useBlocksStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetch = useCallback(async () => {
    if (!bookId || !chapterId) return;

    try {
      setIsLoading(true);
      const response = await getChapterState(bookId, chapterId);

      if (response.success) {
        setChapterId(response.data.current_chapter.id);
        setBlocks(response.data.blocks);
        setAdjacentChapters(
          response.data.prev_chapter ?? null,
          response.data.next_chapter ?? null
        );
      } else {
        console.error("Failed to fetch constructor state:", response.messages);
      }
    } catch (err) {
      console.error("Error fetching constructor state:", err);
    } finally {
      setIsLoading(false);
    }
  }, [bookId, chapterId, setBlocks, setChapterId]);

  useEffect(() => {
    if (bookId && chapterId) {
      fetch();
    }
  }, [bookId, chapterId, fetch]);

  useEffect(() => {
    return () => {
      clearBlocks();
    };
  }, [clearBlocks]);

  return {
    blocks,
    refetch: fetch,
    isLoading,
  };
}
