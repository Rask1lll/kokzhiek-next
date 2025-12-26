import { ConstructorResponse } from "@/app/types/constructorResponse";
import { Widget, WidgetData } from "@/app/types/widget";
import { getAuthHeaders, getToken } from "@/app/libs/auth";
import { API_BASE } from "./constructorApi";

export async function createWidget(
  blockId: number,
  type: string,
  data: WidgetData = {},
  row: number = 0,
  column: number = 0
): Promise<ConstructorResponse<Widget>> {
  const body: Record<string, unknown> = { type, data, row, column };

  const res = await fetch(`${API_BASE}/api/v1/blocks/${blockId}/widgets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("createWidget failed:", res.status, errorText);
    return {
      data: null as unknown as Widget,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

export async function updateWidget(
  widgetId: number,
  data: WidgetData
): Promise<ConstructorResponse<Widget>> {
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
  row: number = 0,
  column: number = 0
): Promise<ConstructorResponse<Widget>> {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);
  formData.append("row", row.toString());
  formData.append("column", column.toString());

  const res = await fetch(`${API_BASE}/api/v1/blocks/${blockId}/widgets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("createWidgetWithFile failed:", res.status, errorText);
    return {
      data: null as unknown as Widget,
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
): Promise<ConstructorResponse<Widget>> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/widgets/${widgetId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("updateWidgetWithFile failed:", res.status, errorText);
    return {
      data: null as unknown as Widget,
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
): Promise<ConstructorResponse<Widget[]>> {
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
): Promise<ConstructorResponse<Widget[]>> {
  const res = await fetch(`${API_BASE}/api/v1/blocks/${blockId}/widgets/swap`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ first_id: firstId, second_id: secondId }),
  });
  return res.json();
}
