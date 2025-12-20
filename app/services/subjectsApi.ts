import { getAuthHeaders } from "../libs/auth";
import { SubjectsResponse } from "../types/subject";

export async function fetchSubjects(): Promise<SubjectsResponse | undefined> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/subjects`,
      {
        headers: getAuthHeaders(),
      }
    );
    return res.json();
  } catch (error) {
    console.error("Error fetching subjects:", error);
  }
}
