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

/** Raw message shape from intake-api: uses 'at' (not 'created_at'), no 'id' field */
interface MessageRaw {
  from: "client" | "kaizen";
  text: string;
  at: string;
}

/** Raw shape from intake-api. Fields: company, name, email (not company_name etc.) */
interface ProjectRaw {
  token: string;
  company: string;
  name: string;
  email: string;
  tier: "starter" | "professional" | "premium";
  status: string;
  created_at: string;
  updated_at: string;
  spec_content?: string;
  messages?: MessageRaw[];
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

/** Normalized project with consistent field names used throughout the portal */
export interface Project extends Omit<ProjectRaw, "company" | "name" | "email" | "messages"> {
  company_name: string;
  contact_name: string;
  contact_email: string;
  messages?: Message[];
}

/** Normalize a raw message: map 'at' -> 'created_at', generate synthetic id */
function normalizeMessage(raw: MessageRaw, index: number): Message {
  return {
    id: `msg-${index}`,
    from: raw.from,
    text: raw.text,
    created_at: raw.at,
  };
}

/** Map API response to portal's expected shape */
function normalizeProject(raw: ProjectRaw): Project {
  const { company, name, email, messages, ...rest } = raw;
  return {
    ...rest,
    company_name: company || "Untitled",
    contact_name: name || "",
    contact_email: email || "",
    messages: messages?.map(normalizeMessage),
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

export interface AnalyticsSummary {
  period: { start: string; end: string };
  page_views: number;
  unique_visitors: number;
  avg_session_duration_ms: number;
  top_pages: { url: string; views: number }[];
  scroll_depth: { depth: number; count: number }[];
  top_clicks: { target: string; text: string; count: number }[];
  daily_views: { date: string; views: number }[];
}

/** Raw shape from GET /project/:token/telemetry */
interface TelemetryResponse {
  token: string;
  period: { from: string; to: string };
  summary: {
    total_sessions: number;
    total_page_views: number;
    total_clicks: number;
    avg_session_duration_ms: number;
    avg_scroll_depth: number;
    top_pages: { url: string; views: number }[];
    top_clicks: { target: string; text: string; count: number }[];
  };
  daily: { date: string; sessions: number; page_views: number }[];
}

/** Map telemetry API response to the portal AnalyticsSummary shape */
function mapTelemetryToAnalytics(raw: TelemetryResponse): AnalyticsSummary {
  const avgDepth = Math.round(raw.summary.avg_scroll_depth);
  return {
    period: { start: raw.period.from, end: raw.period.to },
    page_views: raw.summary.total_page_views,
    unique_visitors: raw.summary.total_sessions,
    avg_session_duration_ms: raw.summary.avg_session_duration_ms,
    top_pages: raw.summary.top_pages,
    scroll_depth: [
      { depth: 25, count: Math.round(raw.summary.total_page_views * Math.min(avgDepth / 25, 1)) },
      { depth: 50, count: Math.round(raw.summary.total_page_views * Math.min(avgDepth / 50, 1)) },
      { depth: 75, count: Math.round(raw.summary.total_page_views * Math.min(avgDepth / 75, 1)) },
      { depth: 100, count: Math.round(raw.summary.total_page_views * Math.min(avgDepth / 100, 1)) },
    ],
    top_clicks: raw.summary.top_clicks,
    daily_views: raw.daily.map((d) => ({ date: d.date, views: d.page_views })),
  };
}

function generateMockAnalytics(period: "7d" | "30d" | "all"): AnalyticsSummary {
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  const end = new Date();
  const start = new Date(end.getTime() - days * 86400000);

  const daily_views: { date: string; views: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    daily_views.push({
      date: d.toISOString().slice(0, 10),
      views: Math.floor(20 + Math.random() * 80),
    });
  }

  const totalViews = daily_views.reduce((s, d) => s + d.views, 0);

  return {
    period: { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) },
    page_views: totalViews,
    unique_visitors: Math.floor(totalViews * 0.6),
    avg_session_duration_ms: 35000 + Math.floor(Math.random() * 25000),
    top_pages: [
      { url: "/", views: Math.floor(totalViews * 0.4) },
      { url: "/om-oss", views: Math.floor(totalViews * 0.22) },
      { url: "/tjanster", views: Math.floor(totalViews * 0.18) },
      { url: "/kontakt", views: Math.floor(totalViews * 0.12) },
      { url: "/priser", views: Math.floor(totalViews * 0.08) },
    ],
    scroll_depth: [
      { depth: 25, count: Math.floor(totalViews * 0.82) },
      { depth: 50, count: Math.floor(totalViews * 0.58) },
      { depth: 75, count: Math.floor(totalViews * 0.34) },
      { depth: 100, count: Math.floor(totalViews * 0.18) },
    ],
    top_clicks: [
      { target: "a.cta-hero", text: "Get Started", count: Math.floor(totalViews * 0.12) },
      { target: "a.nav-link", text: "About Us", count: Math.floor(totalViews * 0.09) },
      { target: "a.nav-link", text: "Services", count: Math.floor(totalViews * 0.07) },
      { target: "button.contact-submit", text: "Send Message", count: Math.floor(totalViews * 0.04) },
      { target: "a.footer-link", text: "Privacy Policy", count: Math.floor(totalViews * 0.02) },
    ],
    daily_views,
  };
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

  async getMyProjects() {
    const data = await request<{ projects: ProjectRaw[]; count: number }>("/my/projects");
    return { projects: data.projects.map(normalizeProject), count: data.count };
  },

  async getProject(token: string) {
    const raw = await request<ProjectRaw>(`/project/${token}`);
    return normalizeProject(raw);
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

  async getAnalytics(projectToken: string, period: "7d" | "30d" | "all" = "7d"): Promise<AnalyticsSummary> {
    const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    try {
      const raw = await request<TelemetryResponse>(
        `/project/${projectToken}/telemetry?days=${days}`
      );
      if (raw.summary.total_page_views === 0 && raw.summary.total_sessions === 0) {
        return generateMockAnalytics(period);
      }
      return mapTelemetryToAnalytics(raw);
    } catch {
      return generateMockAnalytics(period);
    }
  },

  async getProjectAnalytics(token: string, days = 7): Promise<AnalyticsSummary | null> {
    try {
      const raw = await request<TelemetryResponse>(
        `/project/${token}/telemetry?days=${days}`
      );
      if (raw.summary.total_page_views === 0 && raw.summary.total_sessions === 0) {
        return null;
      }
      return mapTelemetryToAnalytics(raw);
    } catch {
      return null;
    }
  },

  createCheckoutSession(data: { company: string; url: string; tier: string }) {
    return request<{ url: string }>("/checkout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getStripeSession(sessionId: string) {
    return fetch(`${API_BASE}/stripe-session/${encodeURIComponent(sessionId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json() as Promise<{ token: string; tier: string; company: string }>;
      });
  },

  setToken,
  clearToken,
  getToken,
};
