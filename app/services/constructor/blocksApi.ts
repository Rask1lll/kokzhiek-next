import { Block } from "@/app/types/block";
import { ConstructorResponse } from "@/app/types/constructorResponse";
import { getAuthHeaders } from "@/app/libs/auth";
import { API_BASE } from "./constructorApi";

export async function createBlock(
  chapterId: number,
  layoutType: string
): Promise<ConstructorResponse<Block>> {
  const res = await fetch(`${API_BASE}/api/v1/chapters/${chapterId}/blocks`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ layout_type: layoutType }),
  });
  return res.json();
}

export async function updateBlocksOrder(
  chapterId: number,
  blocksOrder: { id: number; order: number }[]
): Promise<ConstructorResponse<Block[]>> {
  const res = await fetch(
    `${API_BASE}/api/v1/chapters/${chapterId}/blocks/order`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(blocksOrder),
    }
  );
  return res.json();
}

export async function deleteBlock(blockId: number): Promise<void> {
  await fetch(`${API_BASE}/api/v1/blocks/${blockId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}
