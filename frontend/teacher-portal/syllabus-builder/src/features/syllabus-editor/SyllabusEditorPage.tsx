import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import syllabusApi from "../../lib/api/syllabusApi";
import UserSwitcher from "../common/UserSwitcher";
import CollaborativeReviewPanel from "../review/CollaborativeReviewPanel";
import "./SyllabusEditorPage.css";

type Mode = "create" | "edit";

type SyllabusContent = {
  prerequisites: string;
  relations: string;
  plos: Array<{ code: string; name: string }>;
  clos: Array<{ code: string; name: string }>;
  cloPloMap: Array<{ cloCode: string; ploCode: string; level: string }>;
  assessments: Array<{ name: string; weight: number; description: string }>;
};

type FormModel = {
  subjectCode: string;
  subjectName: string;
  summary: string;
  content: SyllabusContent;
};

function getUserId() {
  return localStorage.getItem("x_user_id") || "1";
}

function safeJsonParse<T>(s?: string | null, fallback: T = {} as T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

function makeDefaultContent(): SyllabusContent {
  return {
    prerequisites: "",
    relations: "",
    plos: [{ code: "PLO1", name: "" }],
    clos: [{ code: "CLO1", name: "" }],
    cloPloMap: [{ cloCode: "CLO1", ploCode: "PLO1", level: "M" }],
    assessments: [
      { name: "Midterm", weight: 40, description: "" },
      { name: "Final", weight: 60, description: "" },
    ],
  };
}

function draftKey(idOrNew: string) {
  return `syllabus_draft_${idOrNew}`;
}

/**
 * Normalize content coming from:
 * - form (object)
 * - server (may be stringified JSON OR object)
 * - localStorage (object)
 */
function normalizeContent(value: any): SyllabusContent {
  if (!value) return makeDefaultContent();

  // If backend returns stringified JSON
  if (typeof value === "string") {
    const parsed = safeJsonParse<SyllabusContent>(value, null as any);
    return parsed || makeDefaultContent();
  }

  // If already an object
  if (typeof value === "object") {
    // ensure minimal shape exists
    return {
      prerequisites: value.prerequisites ?? "",
      relations: value.relations ?? "",
      plos: Array.isArray(value.plos) && value.plos.length ? value.plos : [{ code: "PLO1", name: "" }],
      clos: Array.isArray(value.clos) && value.clos.length ? value.clos : [{ code: "CLO1", name: "" }],
      cloPloMap:
        Array.isArray(value.cloPloMap) && value.cloPloMap.length
          ? value.cloPloMap
          : [{ cloCode: "CLO1", ploCode: "PLO1", level: "M" }],
      assessments:
        Array.isArray(value.assessments) && value.assessments.length
          ? value.assessments
          : [
              { name: "Midterm", weight: 40, description: "" },
              { name: "Final", weight: 60, description: "" },
            ],
    };
  }

  return makeDefaultContent();
}

export default function SyllabusEditorPage({ mode }: { mode: Mode }) {
  const nav = useNavigate();
  const params = useParams();
  const syllabusId = params.id;

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<{ id?: string; rootId?: string; versionNo?: number; status?: string }>(
    {}
  );

  const idForDraft = mode === "edit" && syllabusId ? syllabusId : "new";

  const cached = useMemo(() => {
    const raw = localStorage.getItem(draftKey(idForDraft));
    return safeJsonParse<FormModel>(raw, null as any);
  }, [idForDraft]);

  const form = useForm<FormModel>({
    defaultValues:
      cached || {
        subjectCode: "",
        subjectName: "",
        summary: "",
        content: makeDefaultContent(),
      },
    mode: "onChange",
  });

  const { control, register, getValues, watch, reset } = form;

  const plosArr = useFieldArray({ control, name: "content.plos" });
  const closArr = useFieldArray({ control, name: "content.clos" });
  const mapArr = useFieldArray({ control, name: "content.cloPloMap" });
  const asmArr = useFieldArray({ control, name: "content.assessments" });

  const [tab, setTab] = useState<"general" | "outcomes" | "assess" | "review">("general");

  // Load server detail for edit mode if no local draft yet
  useEffect(() => {
    let alive = true;
    async function run() {
      if (mode !== "edit" || !syllabusId) return;

      if (cached) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await syllabusApi.getById(syllabusId);
        if (!alive) return;

        const contentObj = normalizeContent(data?.content);

        reset({
          subjectCode: data?.subjectCode || "",
          subjectName: data?.subjectName || "",
          summary: data?.summary || "",
          content: contentObj,
        });

        setServerInfo({
          id: data?.id,
          rootId: data?.rootId,
          versionNo: data?.versionNo,
          status: data?.status,
        });
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Failed to load syllabus detail");
      } finally {
        if (alive) setLoading(false);
      }
    }
    run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, syllabusId]);

  // Auto-save local draft (debounced)
  const saveTimer = useRef<number | null>(null);
  const watched = watch();
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        localStorage.setItem(draftKey(idForDraft), JSON.stringify(getValues()));
      } catch {
        // ignore
      }
    }, 600);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watched, idForDraft]);

  /**
   * Try sending content as OBJECT first (preferred).
   * If server rejects and throws, retry once sending STRINGIFIED JSON.
   */
  async function tryCreateDraft(bodyBase: { subjectCode: string; subjectName: string; summary: string }, userId: string) {
    const payload = getValues();
    const contentObj = normalizeContent(payload.content);

    // Attempt 1: object
    try {
      return await syllabusApi.createDraft({ ...bodyBase, content: contentObj } as any, userId);
    } catch (e1: any) {
      // Attempt 2: string
      const contentStr = JSON.stringify(contentObj);
      return await syllabusApi.createDraft({ ...bodyBase, content: contentStr } as any, userId);
    }
  }

  async function tryCreateNewVersion(
    rootId: string,
    bodyBase: { subjectName: string; summary: string; changeNote: string },
    userId: string
  ) {
    const payload = getValues();
    const contentObj = normalizeContent(payload.content);

    // Attempt 1: object
    try {
      return await syllabusApi.createNewVersion(rootId, { ...bodyBase, content: contentObj } as any, userId);
    } catch (e1: any) {
      // Attempt 2: string
      const contentStr = JSON.stringify(contentObj);
      return await syllabusApi.createNewVersion(rootId, { ...bodyBase, content: contentStr } as any, userId);
    }
  }

  async function onSaveToServer() {
    setSaving(true);
    setError(null);

    try {
      const payload = getValues();
      const userId = getUserId();

      if (mode === "create") {
        const created = await tryCreateDraft(
          {
            subjectCode: payload.subjectCode,
            subjectName: payload.subjectName,
            summary: payload.summary,
          },
          userId
        );

        setServerInfo({
          id: created?.id,
          rootId: created?.rootId,
          versionNo: created?.versionNo,
          status: created?.status,
        });

        if (created?.id) {
          localStorage.setItem(draftKey(created.id), JSON.stringify(payload));
          localStorage.removeItem(draftKey("new"));
          nav(`/syllabus/${created.id}`, { replace: true });
        }
        return;
      }

      // edit: create new version
      let rootId = serverInfo.rootId;

      if (!rootId) {
        const current = await syllabusApi.getById(String(syllabusId));
        rootId = current?.rootId;

        setServerInfo({
          id: current?.id,
          rootId: current?.rootId,
          versionNo: current?.versionNo,
          status: current?.status,
        });
      }

      if (!rootId) throw new Error("Missing rootId for versioning");

      const next = await tryCreateNewVersion(
        rootId,
        {
          subjectName: payload.subjectName,
          summary: payload.summary,
          changeNote: "Teacher edit",
        },
        userId
      );

      setServerInfo({
        id: next?.id,
        rootId: next?.rootId,
        versionNo: next?.versionNo,
        status: next?.status,
      });

      if (next?.id) {
        localStorage.setItem(draftKey(next.id), JSON.stringify(payload));
        nav(`/syllabus/${next?.id}`, { replace: true });
      }
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function onSubmit() {
    setSaving(true);
    setError(null);
    try {
      const userId = getUserId();

      if (!serverInfo.id) {
        await onSaveToServer();
      }
      const id = serverInfo.id || (mode === "edit" ? syllabusId : undefined);
      if (!id) throw new Error("Missing syllabus id to submit");

      const res = await syllabusApi.submit(id, userId);
      setServerInfo({
        id: res?.id,
        rootId: res?.rootId,
        versionNo: res?.versionNo,
        status: res?.status,
      });
      alert("Submitted for review!");
    } catch (e: any) {
      setError(e?.message || "Submit failed");
    } finally {
      setSaving(false);
    }
  }

  function onClearLocalDraft() {
    localStorage.removeItem(draftKey(idForDraft));
    alert("Local draft cleared. Reload page to reset.");
  }

  const totalWeight = useMemo(() => {
    const a = getValues().content?.assessments || [];
    return a.reduce((sum, x) => sum + (Number(x.weight) || 0), 0);
  }, [watched, getValues]);

  const canCompare = Boolean(serverInfo.rootId);
  const currentSyllabusIdForReview = serverInfo.id || (mode === "edit" ? syllabusId : undefined);

  return (
    <div className="syllabusEditorPage">
      <div className="editorHeader">
        <div>
          <div className="editorTitleRow">
            <button className="btn" onClick={() => nav("/")}>
              ← Back
            </button>
            <h2 className="editorTitle">Syllabus Editor</h2>
          </div>
          <div className="editorMeta">
            <span className="metaItem">
              Mode: <b>{mode}</b>
            </span>
            {serverInfo.versionNo != null && (
              <span className="metaItem">
                Version: <b>v{serverInfo.versionNo}</b>
              </span>
            )}
            {serverInfo.status && (
              <span className="metaItem">
                Status: <b>{serverInfo.status}</b>
              </span>
            )}
          </div>
        </div>

        <div className="editorRight">
          <UserSwitcher />
          <button className="btn" onClick={() => nav("/notifications")}>
            Notifications
          </button>
          <button className="btn" onClick={onClearLocalDraft} disabled={saving}>
            Clear Local Draft
          </button>
          {canCompare ? (
            <button className="btn" onClick={() => nav(`/syllabus/${serverInfo.rootId}/compare`)}>
              Compare Versions
            </button>
          ) : (
            <button className="btn" onClick={() => alert("Save to server first to get rootId")} disabled={saving}>
              Compare Versions
            </button>
          )}
          <button className="btnPrimary" onClick={onSaveToServer} disabled={saving || loading}>
            {saving ? "Saving..." : "Save to Server"}
          </button>
          <button className="btnPrimary" onClick={onSubmit} disabled={saving || loading}>
            Submit
          </button>
        </div>
      </div>

      {error && (
        <div className="alertError">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="loadingCard">Loading...</div>
      ) : (
        <>
          <div className="tabs">
            <button className={`tab ${tab === "general" ? "active" : ""}`} onClick={() => setTab("general")}>
              General
            </button>
            <button className={`tab ${tab === "outcomes" ? "active" : ""}`} onClick={() => setTab("outcomes")}>
              CLO / PLO
            </button>
            <button className={`tab ${tab === "assess" ? "active" : ""}`} onClick={() => setTab("assess")}>
              Assessments
            </button>
            <button className={`tab ${tab === "review" ? "active" : ""}`} onClick={() => setTab("review")}>
              Review
            </button>
          </div>

          {tab === "general" && (
            <div className="card">
              <div className="grid2">
                <div>
                  <label className="label">Subject Code</label>
                  <input className="input" {...register("subjectCode")} placeholder="e.g. INFS2602" />
                </div>
                <div>
                  <label className="label">Subject Name</label>
                  <input className="input" {...register("subjectName")} placeholder="e.g. Information Systems..." />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="label">Summary</label>
                <textarea className="textarea" {...register("summary")} rows={4} placeholder="Short summary..." />
              </div>

              <div className="grid2" style={{ marginTop: 12 }}>
                <div>
                  <label className="label">Prerequisites</label>
                  <textarea className="textarea" {...register("content.prerequisites")} rows={4} placeholder="Prerequisites..." />
                </div>
                <div>
                  <label className="label">Subject Relations (tree/links - text)</label>
                  <textarea
                    className="textarea"
                    {...register("content.relations")}
                    rows={4}
                    placeholder="Related subjects, dependencies..."
                  />
                </div>
              </div>
            </div>
          )}

          {tab === "outcomes" && (
            <div className="card">
              <div className="grid2">
                <div>
                  <div className="sectionHead">
                    <h3>PLOs</h3>
                    <button className="btn" onClick={() => plosArr.append({ code: `PLO${plosArr.fields.length + 1}`, name: "" })}>
                      + Add PLO
                    </button>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: 110 }}>Code</th>
                        <th>Name</th>
                        <th style={{ width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {plosArr.fields.map((f, idx) => (
                        <tr key={f.id}>
                          <td>
                            <input className="input" {...register(`content.plos.${idx}.code` as const)} />
                          </td>
                          <td>
                            <input className="input" {...register(`content.plos.${idx}.name` as const)} />
                          </td>
                          <td className="tdRight">
                            <button className="btn" onClick={() => plosArr.remove(idx)}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <div className="sectionHead">
                    <h3>CLOs</h3>
                    <button className="btn" onClick={() => closArr.append({ code: `CLO${closArr.fields.length + 1}`, name: "" })}>
                      + Add CLO
                    </button>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th style={{ width: 110 }}>Code</th>
                        <th>Name</th>
                        <th style={{ width: 80 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {closArr.fields.map((f, idx) => (
                        <tr key={f.id}>
                          <td>
                            <input className="input" {...register(`content.clos.${idx}.code` as const)} />
                          </td>
                          <td>
                            <input className="input" {...register(`content.clos.${idx}.name` as const)} />
                          </td>
                          <td className="tdRight">
                            <button className="btn" onClick={() => closArr.remove(idx)}>
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <div className="sectionHead">
                  <h3>CLO ↔ PLO Mapping</h3>
                  <button className="btn" onClick={() => mapArr.append({ cloCode: "CLO1", ploCode: "PLO1", level: "M" })}>
                    + Add Mapping
                  </button>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: 140 }}>CLO</th>
                      <th style={{ width: 140 }}>PLO</th>
                      <th style={{ width: 120 }}>Level</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mapArr.fields.map((f, idx) => (
                      <tr key={f.id}>
                        <td>
                          <input className="input" {...register(`content.cloPloMap.${idx}.cloCode` as const)} />
                        </td>
                        <td>
                          <input className="input" {...register(`content.cloPloMap.${idx}.ploCode` as const)} />
                        </td>
                        <td>
                          <select className="select" {...register(`content.cloPloMap.${idx}.level` as const)}>
                            <option value="L">L</option>
                            <option value="M">M</option>
                            <option value="H">H</option>
                          </select>
                        </td>
                        <td className="tdRight">
                          <button className="btn" onClick={() => mapArr.remove(idx)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="hint">Level: L=Low, M=Medium, H=High</div>
              </div>
            </div>
          )}

          {tab === "assess" && (
            <div className="card">
              <div className="sectionHead">
                <h3>Assessment Weights</h3>
                <div className="rightRow">
                  <div className={`weightPill ${totalWeight === 100 ? "ok" : "bad"}`}>
                    Total: <b>{totalWeight}%</b>
                  </div>
                  <button className="btn" onClick={() => asmArr.append({ name: "New", weight: 0, description: "" })}>
                    + Add Assessment
                  </button>
                </div>
              </div>

              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 220 }}>Name</th>
                    <th style={{ width: 120 }}>Weight (%)</th>
                    <th>Description</th>
                    <th style={{ width: 80 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {asmArr.fields.map((f, idx) => (
                    <tr key={f.id}>
                      <td>
                        <input className="input" {...register(`content.assessments.${idx}.name` as const)} />
                      </td>
                      <td>
                        <input
                          className="input"
                          type="number"
                          step="1"
                          {...register(`content.assessments.${idx}.weight` as const, { valueAsNumber: true })}
                        />
                      </td>
                      <td>
                        <input className="input" {...register(`content.assessments.${idx}.description` as const)} />
                      </td>
                      <td className="tdRight">
                        <button className="btn" onClick={() => asmArr.remove(idx)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="hint">Tip: tổng trọng số nên = 100% trước khi Submit.</div>
            </div>
          )}

          {tab === "review" && (
            <div className="card">
              {!currentSyllabusIdForReview ? (
                <div className="hint">Save to server trước để có syllabusId, rồi mới comment được.</div>
              ) : (
                <CollaborativeReviewPanel syllabusId={String(currentSyllabusIdForReview)} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
