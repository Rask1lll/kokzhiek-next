export function getAuthHeaders() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Access: "application/json",
  };
}
