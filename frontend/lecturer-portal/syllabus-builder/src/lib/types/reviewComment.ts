export interface ReviewCommentResponse {
  id: string;
  syllabusId: string;

  sectionKey: string;
  content: string;

  authorId: number;
  createdAt: string;
}

export interface CreateCommentRequest {
  syllabusId: string;
  sectionKey: string;
  content: string;
}
