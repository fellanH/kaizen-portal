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

export interface ProjectEvent {
  type: "stage_change" | "message" | "deliverable" | "spec_update" | "approval" | "invite";
  description: string;
  actor: "client" | "kaizen" | "system";
  at: string;
}

export interface ContractSection {
  title: string;
  content: string;
}

export interface Contract {
  project_token: string;
  company: string;
  client_name: string;
  client_email: string;
  tier: string;
  created_at: string;
  sections: ContractSection[];
}

export interface ContractResponse {
  contract: Contract;
  accepted: boolean;
  accepted_at: string | null;
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
    sanity_studio_url?: string;
  };
  events?: ProjectEvent[];
  contract_accepted?: boolean;
  contract_accepted_at?: string;
  original_screenshot_url?: string;
}

export interface Message {
  id: string;
  from: "client" | "kaizen";
  text: string;
  created_at: string;
  project_token?: string;
  company_name?: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  description: string;
  status: "succeeded" | "pending" | "failed";
  created_at: string;
  receipt_url?: string;
  project_token?: string;
}

export interface NotificationPreferences {
  stage_changes: boolean;
  messages: boolean;
  weekly_summary: boolean;
}

export interface Collaborator {
  email: string;
  role: "owner" | "viewer";
  invited_by: string;
  invited_at: string;
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

  approve(token: string, action: "approve" | "revise" | "accept_contract", message?: string) {
    return request<{ ok: boolean }>(`/project/${token}/approve`, {
      method: "POST",
      body: JSON.stringify({ action, message }),
    });
  },

  getEvents(token: string, limit = 50, offset = 0) {
    return request<{ events: ProjectEvent[]; total: number }>(
      `/project/${token}/events?limit=${limit}&offset=${offset}`
    );
  },

  getContract(token: string) {
    return request<ContractResponse>(`/project/${token}/contract`);
  },

  getPayments() {
    return request<{ payments: Payment[] }>("/my/payments");
  },

  getPreferences() {
    return request<{ preferences: NotificationPreferences }>("/my/preferences");
  },

  updatePreferences(prefs: Partial<NotificationPreferences>) {
    return request<{ ok: boolean; preferences: NotificationPreferences }>("/my/preferences", {
      method: "PATCH",
      body: JSON.stringify(prefs),
    });
  },

  inviteCollaborator(token: string, email: string, role: "owner" | "viewer" = "viewer") {
    return request<{ ok: boolean }>(`/project/${token}/invite`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  },

  removeCollaborator(token: string, email: string) {
    return request<{ ok: boolean }>(`/project/${token}/invite/${encodeURIComponent(email)}`, {
      method: "DELETE",
    });
  },

  getCollaborators(token: string) {
    return request<{ collaborators: Collaborator[] }>(`/project/${token}/collaborators`);
  },

  setToken,
  clearToken,
  getToken,
};
