export type RecruiterVisitInput = {
  email: string;
  companyName: string;
  reasonForVisit: string;
};

export type RecruiterVisitResponse = {
  status: "logged";
  emailSent: boolean;
  message: string;
};

export type AdminSessionResponse = {
  authenticated: boolean;
  adminId: string | null;
};

export type AdminLoginInput = {
  adminId: string;
  password: string;
};

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

function resolveUrl(path: string): string {
  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(resolveUrl(path), {
    credentials: "include",
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Request failed";

    throw new Error(message);
  }

  return payload as T;
}

export function submitRecruiterVisit(input: RecruiterVisitInput) {
  return request<RecruiterVisitResponse>("/api/visitors/intake", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getAdminSession() {
  return request<AdminSessionResponse>("/api/admin/session");
}

export function loginAdmin(input: AdminLoginInput) {
  return request<AdminSessionResponse>("/api/admin/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logoutAdmin() {
  return request<{ authenticated: false }>("/api/admin/logout", {
    method: "POST",
  });
}
