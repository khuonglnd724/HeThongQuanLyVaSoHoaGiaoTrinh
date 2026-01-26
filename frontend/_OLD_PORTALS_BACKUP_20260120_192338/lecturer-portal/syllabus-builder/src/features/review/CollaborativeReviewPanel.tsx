import React, { useEffect, useMemo, useState } from "react";
import {
  addComment,
  deleteComment,
  listComments,
} from "../../lib/api/reviewCommentApi";
import type { ReviewCommentResponse } from "../../lib/types";
import "./CollaborativeReviewPanel.css";

type Props = {
  syllabusId?: string; // có thể undefined lúc chưa Save to Server
};

type SectionOption = {
  key: string;
  label: string;
};

const SECTION_OPTIONS: SectionOption[] = [
  { key: "general", label: "Thông tin chung" },
  { key: "prerequisites", label: "Học phần tiên quyết" },
  { key: "relations", label: "Quan hệ học phần" },
  { key: "plos", label: "PLO" },
  { key: "clos", label: "CLO" },
  { key: "cloPloMap", label: "Ma trận CLO – PLO" },
  { key: "assessments", label: "Đánh giá" },
];

function formatTime(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function CollaborativeReviewPanel({ syllabusId }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [comments, setComments] = useState<ReviewCommentResponse[]>([]);
  const [sectionKey, setSectionKey] = useState<string>("general");
  const [content, setContent] = useState<string>("");

  const canLoad = Boolean(syllabusId);

  const grouped = useMemo(() => {
    const map = new Map<string, ReviewCommentResponse[]>();
    for (const c of comments) {
      const k = c.sectionKey || "general";
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(c);
    }
    // sắp xếp theo thời gian tăng dần
    for (const arr of map.values()) {
      arr.sort((a, b) =>
        String(a.createdAt || "").localeCompare(String(b.createdAt || ""))
      );
    }
    return map;
  }, [comments]);

  async function load() {
    if (!syllabusId) {
      setComments([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await listComments(syllabusId);
      setComments(res || []);
    } catch (e: any) {
      setError(e?.message || "Không tải được danh sách nhận xét");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syllabusId]);

  async function handleAdd() {
    if (!syllabusId) {
      setError("Vui lòng lưu đề cương lên hệ thống trước khi nhận xét.");
      return;
    }
    const text = content.trim();
    if (!text) return;

    setError(null);
    setLoading(true);
    try {
      await addComment({
        syllabusId,
        sectionKey,
        content: text,
      });
      setContent("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Thêm nhận xét thất bại");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setLoading(true);
    try {
      await deleteComment(id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Xoá nhận xét thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reviewPanel">
      <div className="reviewHeader">
        <div className="reviewTitle">Nhận xét & Phản hồi</div>
        <button className="btn" onClick={load} disabled={loading || !canLoad}>
          Làm mới
        </button>
      </div>

      {!canLoad && (
        <div className="hint">
          Vui lòng <b>Lưu lên hệ thống</b> để bật chức năng nhận xét.
        </div>
      )}

      {error && (
        <div className="alertError">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      <div className="composer">
        <div className="composerRow">
          <div className="field">
            <label className="label" htmlFor="review-section">
              Khu vực
            </label>
            <select
              id="review-section"
              className="select"
              value={sectionKey}
              onChange={(e) => setSectionKey(e.target.value)}
              aria-label="Chọn khu vực nhận xét"
              disabled={!canLoad}
            >
              {SECTION_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btnPrimary"
            onClick={handleAdd}
            disabled={loading || !canLoad}
          >
            Thêm nhận xét
          </button>
        </div>

        <label className="label" htmlFor="review-content">
          Nội dung nhận xét
        </label>
        <textarea
          id="review-content"
          className="textarea"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập nội dung nhận xét..."
          aria-label="Nội dung nhận xét"
          disabled={!canLoad}
        />
      </div>

      <div className="commentList">
        {loading ? (
          <div className="hint">Đang tải nhận xét...</div>
        ) : comments.length === 0 ? (
          <div className="hint">Chưa có nhận xét nào.</div>
        ) : (
          SECTION_OPTIONS.map((sec) => {
            const arr = grouped.get(sec.key) || [];
            if (arr.length === 0) return null;

            return (
              <div key={sec.key} className="sectionBlock">
                <div className="sectionHeader">{sec.label}</div>

                {arr.map((c) => (
                  <div key={c.id} className="commentCard">
                    <div className="commentMeta">
                      <span>Tác giả: {c.authorId}</span>
                      <span>{formatTime(c.createdAt)}</span>
                    </div>

                    <div className="commentBody">{c.content}</div>

                    <div className="commentActions">
                      <button
                        className="btn"
                        onClick={() => handleDelete(c.id)}
                        disabled={loading}
                      >
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
