const API_BASE = process.env.NEXT_PUBLIC_SERVER_URL;

function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Access: "application/json",
  };
}

// Types matching API response
export type ApiWidgetData = Record<string, unknown>;

export type ApiWidget = {
  id: number;
  type: string;
  order: number;
  data: ApiWidgetData;
};

export type ApiBlock = {
  id: number;
  layout_type: string;
  order: number;
  widgets: ApiWidget[];
};

export type ApiChapter = {
  id: number;
  title: string;
  order: number;
};

export type ApiBook = {
  id: number;
  title: string;
};

export type ConstructorState = {
  book: ApiBook;
  current_chapter: ApiChapter;
  blocks: ApiBlock[];
  available_widget_types: string[];
};

export type ApiResponse<T> = {
  data: T;
  messages: string[];
  success: boolean;
};

// Layout type mapping between frontend and backend
export const layoutTypeMap: Record<string, string> = {
  // Frontend -> Backend
  full: "single",
  two_equal: "split",
  left_wide: "hero",
  right_wide: "hero",
  three_cols: "2-column",
};

export const reverseLayoutTypeMap: Record<string, string> = {
  // Backend -> Frontend
  single: "full",
  split: "two_equal",
  hero: "left_wide",
  "2-column": "three_cols",
};

// ========== Constructor State ==========

export async function getConstructorState(
  bookId: string
): Promise<ApiResponse<ConstructorState>> {
  const res = await fetch(`${API_BASE}/api/v1/books/${bookId}/constructor`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getChapterState(
  bookId: string,
  chapterId: string
): Promise<ApiResponse<ConstructorState>> {
  const res = await fetch(
    `${API_BASE}/api/v1/books/${bookId}/constructor/chapters/${chapterId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return res.json();
}

// ========== Blocks ==========

export async function createBlock(
  chapterId: number,
  layoutType: string
): Promise<ApiResponse<ApiBlock>> {
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
): Promise<ApiResponse<ApiBlock[]>> {
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

// ========== Widgets ==========

export async function createWidget(
  blockId: number,
  type: string,
  data: ApiWidgetData = {},
  order?: number
): Promise<ApiResponse<ApiWidget>> {
  const body: Record<string, unknown> = { type, data };
  if (order !== undefined) {
    body.order = order;
  }

  const res = await fetch(`${API_BASE}/api/v1/blocks/${blockId}/widgets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("createWidget failed:", res.status, errorText);
    return {
      data: null as unknown as ApiWidget,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

export async function updateWidget(
  widgetId: number,
  data: ApiWidgetData
): Promise<ApiResponse<ApiWidget>> {
  const res = await fetch(`${API_BASE}/api/v1/widgets/${widgetId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ data }),
  });
  return res.json();
}

// Create widget with file (image, video, audio)
export async function createWidgetWithFile(
  blockId: number,
  type: string,
  file: File,
  order?: number
): Promise<ApiResponse<ApiWidget>> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);
  if (order !== undefined) {
    formData.append("order", order.toString());
  }

  const res = await fetch(`${API_BASE}/api/v1/blocks/${blockId}/widgets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("createWidgetWithFile failed:", res.status, errorText);
    return {
      data: null as unknown as ApiWidget,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Update widget with file (image, video, audio)
export async function updateWidgetWithFile(
  widgetId: number,
  file: File
): Promise<ApiResponse<ApiWidget>> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/widgets/${widgetId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("updateWidgetWithFile failed:", res.status, errorText);
    return {
      data: null as unknown as ApiWidget,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

export async function deleteWidget(widgetId: number): Promise<void> {
  await fetch(`${API_BASE}/api/v1/widgets/${widgetId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

export async function reorderWidgets(
  blockId: number,
  widgetsOrder: { id: number; order: number }[]
): Promise<ApiResponse<ApiWidget[]>> {
  const res = await fetch(
    `${API_BASE}/api/v1/blocks/${blockId}/widgets/reorder`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(widgetsOrder),
    }
  );
  return res.json();
}

export async function swapWidgets(
  blockId: number,
  firstId: number,
  secondId: number
): Promise<ApiResponse<ApiWidget[]>> {
  const res = await fetch(`${API_BASE}/api/v1/blocks/${blockId}/widgets/swap`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ first_id: firstId, second_id: secondId }),
  });
  return res.json();
}
