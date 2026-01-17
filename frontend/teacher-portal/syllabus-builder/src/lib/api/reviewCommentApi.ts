import { http } from "../http";
import type { CreateCommentRequest, ReviewCommentResponse } from "../types";

export async function addComment(
  req: CreateCommentRequest
): Promise<ReviewCommentResponse> {
  const res = await http.post("/api/review-comments", req);
  return res.data;
}

export async function listComments(
  syllabusId: string
): Promise<ReviewCommentResponse[]> {
  const res = await http.get(`/api/review-comments/syllabus/${syllabusId}`);
  return res.data;
}

export async function deleteComment(id: string): Promise<void> {
  await http.delete(`/api/review-comments/${id}`);
}
