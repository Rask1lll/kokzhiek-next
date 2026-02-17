import { ConstructorResponse } from "@/app/types/constructorResponse";
import { getAuthHeaders, getToken } from "@/app/libs/auth";
import { API_BASE } from "./constructorApi";
import {
  Question,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  ReorderQuestionsPayload,
  QuestionOption,
} from "@/app/types/question";

// Get all questions for a widget
export async function getQuestions(
  widgetId: number
): Promise<ConstructorResponse<Question[]>> {
  const res = await fetch(`${API_BASE}/api/v1/widgets/${widgetId}/questions`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("getQuestions failed:", res.status, errorText);
    return {
      data: [],
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Create a new question
export async function createQuestion(
  widgetId: number,
  payload: CreateQuestionPayload
): Promise<ConstructorResponse<Question>> {
  const res = await fetch(`${API_BASE}/api/v1/widgets/${widgetId}/questions`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("createQuestion failed:", res.status, errorText);
    return {
      data: null as unknown as Question,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Get a single question
export async function getQuestion(
  questionId: number
): Promise<ConstructorResponse<Question>> {
  const res = await fetch(`${API_BASE}/api/v1/questions/${questionId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("getQuestion failed:", res.status, errorText);
    return {
      data: null as unknown as Question,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Update a question
export async function updateQuestion(
  questionId: number,
  payload: UpdateQuestionPayload
): Promise<ConstructorResponse<Question>> {
  const res = await fetch(`${API_BASE}/api/v1/questions/${questionId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("updateQuestion failed:", res.status, errorText);
    return {
      data: null as unknown as Question,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Delete a question
export async function deleteQuestion(questionId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/questions/${questionId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to delete question: ${res.status} ${errorText}`);
  }
}

// Reorder questions
export async function reorderQuestions(
  widgetId: number,
  payload: ReorderQuestionsPayload
): Promise<ConstructorResponse<Question[]>> {
  const res = await fetch(
    `${API_BASE}/api/v1/widgets/${widgetId}/questions/reorder`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("reorderQuestions failed:", res.status, errorText);
    return {
      data: [],
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Upload image for a question option
export async function uploadOptionImage(
  optionId: number,
  file: File
): Promise<ConstructorResponse<{ image_url: string; option: QuestionOption }>> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/api/v1/options/${optionId}/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("uploadOptionImage failed:", res.status, errorText);
    return {
      data: null as unknown as { image_url: string; option: QuestionOption },
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Delete image from a question option
export async function deleteOptionImage(
  optionId: number
): Promise<ConstructorResponse<QuestionOption>> {
  const res = await fetch(`${API_BASE}/api/v1/options/${optionId}/image`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("deleteOptionImage failed:", res.status, errorText);
    return {
      data: null as unknown as QuestionOption,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Upload image for a question
export async function uploadQuestionImage(
  questionId: number,
  file: File
): Promise<ConstructorResponse<{ image_url: string; question: Question }>> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/api/v1/questions/${questionId}/image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("uploadQuestionImage failed:", res.status, errorText);
    return {
      data: null as unknown as { image_url: string; question: Question },
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Upload conditional sign image for a question
export async function uploadSignImage(
  questionId: number,
  file: File
): Promise<ConstructorResponse<{ sign_url: string; question: Question }>> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/api/v1/questions/${questionId}/sign`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      Accept: "application/json",
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("uploadSignImage failed:", res.status, errorText);
    return {
      data: null as unknown as { sign_url: string; question: Question },
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}

// Delete conditional sign image from a question
export async function deleteSignImage(
  questionId: number
): Promise<ConstructorResponse<Question>> {
  const res = await fetch(`${API_BASE}/api/v1/questions/${questionId}/sign`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("deleteSignImage failed:", res.status, errorText);
    return {
      data: null as unknown as Question,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  // Handle 204 No Content or empty body
  const text = await res.text();
  if (!text) {
    return { data: null as unknown as Question, messages: [], success: true };
  }
  return JSON.parse(text);
}

// Delete image from a question
export async function deleteQuestionImage(
  questionId: number
): Promise<ConstructorResponse<Question>> {
  const res = await fetch(`${API_BASE}/api/v1/questions/${questionId}/image`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("deleteQuestionImage failed:", res.status, errorText);
    return {
      data: null as unknown as Question,
      messages: [`HTTP ${res.status}: ${errorText}`],
      success: false,
    };
  }

  return res.json();
}
