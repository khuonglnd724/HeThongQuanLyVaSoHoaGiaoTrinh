import { api } from "../../lib/api";
import type { SyllabusListItem } from "../../lib/types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function listSyllabuses(): Promise<SyllabusListItem[]> {
  const res = await api.get<ApiResponse<SyllabusListItem[]>>(
    "/api/v1/syllabus"
  );
  return res.data.data;
}
