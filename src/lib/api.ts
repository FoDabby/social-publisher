// API fetch wrapper that automatically includes auth token
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("token") || "";
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Don't override Content-Type if it's FormData
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, { ...options, headers });
  // If unauthorized, redirect to login
  if (res.status === 401 && !url.includes("/auth/")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth";
  }
  return res;
}
