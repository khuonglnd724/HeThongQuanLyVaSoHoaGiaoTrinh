import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import syllabusApi, { SyllabusListItem, WorkflowStatus } from "../../lib/api/syllabusApi";
import "./SyllabusListPage.css";

type StatusFilter = WorkflowStatus | "ALL";

function formatDate(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function VersionBadge({ v }: { v: number }) {
  return <span className="versionBadge">v{v}</span>;
}

function StatusPill({ status }: { status: string }) {
  const cls = `statusPill status-${String(status).toLowerCase().replace(/\s+/g, "-")}`;
  return <span className={cls}>{status}</span>;
}

export default function SyllabusListPage() {
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<SyllabusListItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const statusOptions: StatusFilter[] = useMemo(
    () => ["ALL", "DRAFT", "PENDING_REVIEW", "PENDING_APPROVAL", "APPROVED", "PUBLISHED", "REJECTED"],
    []
  );

  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const t = window.setTimeout(() => setQDebounced(q), 350);
    return () => window.clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setPage(0);
  }, [qDebounced, status, size]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await syllabusApi.list({
        q: qDebounced.trim(),
        status,
        page,
        size,
      });
      setItems(res.items ?? []);
      setTotalPages(res.totalPages ?? 0);
      setTotalItems(res.totalItems ?? 0);
    } catch (e: any) {
      setError(e?.message || "Failed to load syllabuses");
      setItems([]);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, status, page, size]);

  function onPrev() {
    setPage((p) => Math.max(0, p - 1));
  }
  function onNext() {
    setPage((p) => (totalPages > 0 ? Math.min(totalPages - 1, p + 1) : p + 1));
  }

  function onOpen(item: SyllabusListItem) {
    nav(`/syllabus/${item.id}`);
  }

  return (
    <div className="syllabusListPage">
      <div className="pageHeader">
        <div>
          <h2 className="pageTitle">Danh sách giáo trình</h2>
          <div className="pageSubtitle">Tìm kiếm, lọc và quản lý các phiên bản giáo trình</div>
        </div>

        <div className="headerActions">
          <button className="btn-primary" onClick={() => nav("/syllabus/new")}>
            + Tạo bản nháp
          </button>
        </div>
      </div>

      <div className="filtersBar">
        <div className="filterGroup">
          <label className="label" htmlFor="syll-search">
            Search
          </label>
          <input
            id="syll-search"
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Subject code, name, keyword..."
          />
        </div>

        <div className="filterGroup">
          <label className="label" htmlFor="syll-status">
            Status
          </label>
          <select
            id="syll-status"
            className="select"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="filterGroup">
          <label className="label" htmlFor="syll-size">
            Page size
          </label>
          <select
            id="syll-size"
            className="select"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="filterRight">
          <button className="btn-secondary" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alertError">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="tableCard">
        <div className="tableMeta">
          <div>
            Total: <strong>{totalItems}</strong>
          </div>
          <div>
            Page: <strong>{page + 1}</strong> / <strong>{Math.max(totalPages, page + 1)}</strong>
          </div>
        </div>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Version</th>
                <th>Status</th>
                <th>Updated</th>
                <th className="colActions"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="tdCenter">
                    Loading...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="tdCenter">
                    No results
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it.id}>
                    <td>
                      <div className="subjectMain">
                        <div className="subjectCode">{it.subjectCode}</div>
                        <div className="subjectName">{it.subjectName}</div>
                      </div>
                    </td>
                    <td>
                      <VersionBadge v={it.version ?? 1} />
                    </td>
                    <td>
                      <StatusPill status={String(it.status ?? "UNKNOWN")} />
                    </td>
                    <td>{formatDate(it.updatedAt || it.createdAt)}</td>
                    <td className="tdRight">
                      <button className="btn-info" onClick={() => onOpen(it)}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="paginationBar">
          <button className="btn-secondary" onClick={onPrev} disabled={loading || page <= 0}>
            Prev
          </button>
          <button
            className="btn-secondary"
            onClick={onNext}
            disabled={loading || (totalPages > 0 && page >= totalPages - 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
