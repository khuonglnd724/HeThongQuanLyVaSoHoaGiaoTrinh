import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactDiffViewer from "react-diff-viewer-continued";
import syllabusApi from "../../lib/api/syllabusApi";
import "./SyllabusComparePage.css";

function prettyJson(data: any) {
  try {
    if (!data) return "";
    if (typeof data === "string") {
      return JSON.stringify(JSON.parse(data), null, 2);
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return typeof data === "string" ? data : JSON.stringify(data, null, 2);
  }
}

export default function SyllabusComparePage() {
  const navigate = useNavigate();
  const params = useParams<{ rootId: string }>();
  const rootId = params.rootId; // string | undefined

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [versions, setVersions] = useState<any[]>([]);
  const [v1, setV1] = useState<number>(1);
  const [v2, setV2] = useState<number>(2);

  const [left, setLeft] = useState<any | null>(null);
  const [right, setRight] = useState<any | null>(null);

  const leftText = useMemo(() => prettyJson(left?.content), [left]);
  const rightText = useMemo(() => prettyJson(right?.content), [right]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!rootId) {
        setLoading(false);
        setError("Thiếu rootId trên URL. Vui lòng quay lại danh sách và chọn so sánh.");
        return;
      }

      const rid: string = rootId;

      setLoading(true);
      setError(null);

      try {
        const list = await syllabusApi.listVersions(rid);
        const sorted = [...(list || [])].sort(
          (a: any, b: any) => (a.versionNo ?? 0) - (b.versionNo ?? 0)
        );

        if (!alive) return;

        setVersions(sorted);

        if (sorted.length < 2) {
          setLeft(null);
          setRight(null);
          setError("Cần ít nhất 2 phiên bản để so sánh.");
          return;
        }

        const latest = sorted[sorted.length - 1];
        const previous = sorted[sorted.length - 2];

        const defaultV1 = Number(previous?.versionNo ?? 1);
        const defaultV2 = Number(latest?.versionNo ?? 2);

        setV1(defaultV1);
        setV2(defaultV2);

        const result = await syllabusApi.compare(rid, defaultV1, defaultV2);

        if (!alive) return;

        setLeft(result?.find((x: any) => x.versionNo === defaultV1) ?? null);
        setRight(result?.find((x: any) => x.versionNo === defaultV2) ?? null);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Không tải được dữ liệu so sánh");
        setLeft(null);
        setRight(null);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [rootId]);

  async function handleCompare() {
    if (!rootId) {
      setError("Thiếu rootId trên URL.");
      return;
    }
    const rid: string = rootId;

    setLoading(true);
    setError(null);

    try {
      const result = await syllabusApi.compare(rid, v1, v2);
      setLeft(result?.find((x: any) => x.versionNo === v1) ?? null);
      setRight(result?.find((x: any) => x.versionNo === v2) ?? null);
    } catch (e: any) {
      setError(e?.message || "So sánh thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="comparePage">
      <div className="compareHeader">
        <div>
          <button className="btn" onClick={() => navigate("/")}>
            ← Quay lại
          </button>
          <h2 className="title">So sánh phiên bản đề cương</h2>
          <div className="sub">Root ID: {rootId || "-"}</div>
        </div>

        <div className="picker">
          <div className="pickerItem">
            <label className="label" htmlFor="versionLeft">
              Phiên bản trái
            </label>
            <select
              id="versionLeft"
              className="select"
              value={v1}
              onChange={(e) => setV1(Number(e.target.value))}
              aria-label="Chọn phiên bản bên trái"
              disabled={versions.length === 0}
            >
              {versions.map((v) => (
                <option key={v.id} value={v.versionNo}>
                  v{v.versionNo}
                </option>
              ))}
            </select>
          </div>

          <div className="pickerItem">
            <label className="label" htmlFor="versionRight">
              Phiên bản phải
            </label>
            <select
              id="versionRight"
              className="select"
              value={v2}
              onChange={(e) => setV2(Number(e.target.value))}
              aria-label="Chọn phiên bản bên phải"
              disabled={versions.length === 0}
            >
              {versions.map((v) => (
                <option key={v.id} value={v.versionNo}>
                  v{v.versionNo}
                </option>
              ))}
            </select>
          </div>

          <button className="btnPrimary" onClick={handleCompare} disabled={loading || !rootId}>
            {loading ? "Đang tải..." : "So sánh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="alertError">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className="metaRow">
            <div className="metaCard">
              <div className="metaTitle">Bên trái</div>
              <div className="metaText">
                {left?.subjectCode ? `${left.subjectCode} – ${left.subjectName}` : "-"}{" "}
                {left?.versionNo != null ? `(v${left.versionNo})` : ""}
              </div>
            </div>

            <div className="metaCard">
              <div className="metaTitle">Bên phải</div>
              <div className="metaText">
                {right?.subjectCode ? `${right.subjectCode} – ${right.subjectName}` : "-"}{" "}
                {right?.versionNo != null ? `(v${right.versionNo})` : ""}
              </div>
            </div>
          </div>

          <div className="diffCard">
            <ReactDiffViewer
              oldValue={leftText}
              newValue={rightText}
              splitView={true}
              showDiffOnly={false}
              leftTitle={`Phiên bản v${left?.versionNo ?? v1}`}
              rightTitle={`Phiên bản v${right?.versionNo ?? v2}`}
            />
          </div>
        </>
      )}
    </div>
  );
}
