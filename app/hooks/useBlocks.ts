"use client";

import { useCallback } from "react";
import { useBlocksStore } from "@/app/store/blocksStore";
import {
  createBlock,
  deleteBlock,
  updateBlocksOrder,
} from "@/app/services/constructor/blocksApi";

export function useBlocks() {
  const {
    blocks,
    chapterId,
    addBlockLocal,
    removeBlockLocal,
    swapBlocksLocal,
  } = useBlocksStore();

  // Create block
  const create = useCallback(
    async (layoutType: string) => {
      if (!chapterId) {
        console.error("No chapter ID set");
        return null;
      }

      try {
        const response = await createBlock(chapterId, layoutType);

        if (response.success) {
          addBlockLocal({
            ...response.data,
            widgets: response.data.widgets || [],
          });
          return response.data;
        } else {
          console.error("Failed to create block:", response.messages);
          return null;
        }
      } catch (err) {
        console.error("Error creating block:", err);
        return null;
      }
    },
    [chapterId, addBlockLocal]
  );

  // Delete block
  const remove = useCallback(
    async (blockId: number) => {
      try {
        await deleteBlock(blockId);
        removeBlockLocal(blockId);
        return true;
      } catch (err) {
        console.error("Error deleting block:", err);
        return false;
      }
    },
    [removeBlockLocal]
  );

  const swap = useCallback(
    async (firstId: number, secondId: number) => {
      if (!chapterId) return false;

      swapBlocksLocal(firstId, secondId);

      try {
        const currentBlocks = useBlocksStore.getState().blocks;
        const blocksOrder = currentBlocks.map((b) => ({
          id: b.id,
          order: b.order,
        }));

        await updateBlocksOrder(chapterId, blocksOrder);
        return true;
      } catch (err) {
        console.error("Error swapping blocks:", err);
        swapBlocksLocal(secondId, firstId);
        return false;
      }
    },
    [chapterId, swapBlocksLocal]
  );

  // Get block by ID
  const getById = useCallback(
    (blockId: number) => {
      return blocks.find((b) => b.id === blockId) || null;
    },
    [blocks]
  );

  return {
    blocks,
    create,
    remove,
    swap,
    getById,
  };
}
