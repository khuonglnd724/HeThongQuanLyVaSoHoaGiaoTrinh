// src/lib/api/syllabusApi.ts

export type WorkflowStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PUBLISHED"
  | "REJECTED"
  | string;

export interface SyllabusListItem {
  id: string;
  rootId?: string;
  subjectCode: string;
  subjectName: string;
  version: number;
  status: WorkflowStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface ListSyllabusParams {
  q?: string;
  status?: WorkflowStatus | "ALL";
  page?: number;
  size?: number;
}

export type CreateDraftRequest = {
  subjectCode: string;
  subjectName: string;
  summary?: string;
  content?: string; // JSON string
};

export type UpdateAsNewVersionRequest = {
  subjectName?: string;
  summary?: string;
  content?: string; // JSON string
  changeNote?: string;
};

const BASE_URL =
  (import.meta as any).env?.VITE_SYLLABUS_API_URL || "http://localhost:8085";

const ENDPOINTS = {
  list: "/api/syllabuses",
  byId: (id: string) => `/api/syllabuses/${id}`,
  versions: (rootId: string) => `/api/syllabuses/${rootId}/versions`,
  createVersion: (rootId: string) => `/api/syllabuses/${rootId}/versions`,
  compare: (rootId: string) => `/api/syllabuses/${rootId}/compare`,
  submit: (id: string) => `/api/syllabuses/${id}/submit`,
};

function buildUrl(path: string, params?: Record<string, any>) {
  const url = new URL(BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "" || v === "ALL") return;
      url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

function getUserIdHeader(explicit?: string) {
  const userId = explicit || localStorage.getItem("x_user_id") || "1";
  return { "X-User-Id": userId };
}

async function request<T>(
  path: string,
  init: RequestInit & { params?: Record<string, any>; userId?: string } = {}
): Promise<T> {
  const { params, userId, ...rest } = init;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(rest.headers || {}),
    ...getUserIdHeader(userId),
  };

  const url = buildUrl(path, params);
  const res = await fetch(url, { ...rest, headers });

  const isJson = res.headers.get("content-type")?.includes("application/json");

  if (!res.ok) {
    const body = isJson ? await res.json().catch(() => null) : null;
    throw new Error(body?.message || body?.error || `HTTP ${res.status}`);
  }

  return (isJson ? await res.json() : null) as T;
}

function normalizePage(raw: any): PageResponse<SyllabusListItem> {
  return {
    items: raw?.content ?? [],
    page: raw?.number ?? 0,
    size: raw?.size ?? 0,
    totalItems: raw?.totalElements ?? 0,
    totalPages: raw?.totalPages ?? 0,
  };
}

export const syllabusApi = {
  async list(params: ListSyllabusParams = {}): Promise<PageResponse<SyllabusListItem>> {
    const raw = await request<any>(ENDPOINTS.list, {
      method: "GET",
      params: {
        q: params.q,
        status: params.status,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    });
    return normalizePage(raw);
  },

  async getById(id: string) {
    return request<any>(ENDPOINTS.byId(id), { method: "GET" });
  },

  async createDraft(body: CreateDraftRequest, userId?: string) {
    return request<any>(ENDPOINTS.list, {
      method: "POST",
      userId,
      body: JSON.stringify(body),
    });
  },

  async createNewVersion(rootId: string, body: UpdateAsNewVersionRequest, userId?: string) {
    return request<any>(ENDPOINTS.createVersion(rootId), {
      method: "POST",
      userId,
      body: JSON.stringify(body),
    });
  },

  async listVersions(rootId: string) {
    return request<any[]>(ENDPOINTS.versions(rootId), { method: "GET" });
  },

  async compare(rootId: string, v1: number, v2: number) {
    return request<any[]>(ENDPOINTS.compare(rootId), {
      method: "GET",
      params: { v1, v2 },
    });
  },

  async submit(id: string, userId?: string) {
    return request<any>(ENDPOINTS.submit(id), { method: "POST", userId });
  },
};

export default syllabusApi;
