const API_BASE = "https://kaizen-intake-api.fehellstrom.workers.dev";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("kaizen_jwt");
}

function setToken(token: string) {
  localStorage.setItem("kaizen_jwt", token);
}

function clearToken() {
  localStorage.removeItem("kaizen_jwt");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json();
}

export interface Project {
  token: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  tier: "starter" | "professional" | "premium";
  status: string;
  created_at: string;
  updated_at: string;
  spec_content?: string;
  messages?: Message[];
  deliverables?: {
    preview_url?: string;
    urls?: { label: string; url: string }[];
  };
}

export interface Message {
  id: string;
  from: "client" | "kaizen";
  text: string;
  created_at: string;
  project_token?: string;
  company_name?: string;
}

export interface AuthUser {
  email: string;
}

export const api = {
  login(email: string) {
    return request<{ ok: boolean; message: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  verify(token: string) {
    return request<{ ok: boolean; jwt: string; email: string }>(
      `/auth/verify?token=${encodeURIComponent(token)}`
    );
  },

  getMe() {
    return request<AuthUser>("/auth/me");
  },

  getMyProjects() {
    return request<{ projects: Project[]; count: number }>("/my/projects");
  },

  getProject(token: string) {
    return request<Project>(`/project/${token}`);
  },

  sendMessage(token: string, text: string) {
    return request<{ ok: boolean }>(`/project/${token}/message`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },

  approve(token: string, action: "approve" | "revise", message?: string) {
    return request<{ ok: boolean }>(`/project/${token}/approve`, {
      method: "POST",
      body: JSON.stringify({ action, message }),
    });
  },

  setToken,
  clearToken,
  getToken,
};
