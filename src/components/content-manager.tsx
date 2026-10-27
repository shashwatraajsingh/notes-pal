"use client";

import Link from "next/link";
import { useDialog } from "@/hooks/use-dialog";
import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleHelp,
  FileJson,
  Flag,
  Layers3,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { z } from "zod";
import {
  AcademicFields,
  Empty,
  Markdown,
  PageHeading,
  type ContentProps,
} from "@/components/workspace";
import {
  academic,
  deckSchema,
  kinds,
  newId,
  noteSchema,
  quizSchema,
  workspaceSchema,
  type Academic,
  type Deck,
  type Note,
  type Quiz,
} from "@/lib/workspace";

type Entry = Note | Quiz | Deck;
type Collection = "notes" | "quizzes" | "decks";
const importSchema = z
  .object({
    notes: z.array(noteSchema).max(2000).optional(),
    quizzes: z.array(quizSchema).max(500).optional(),
    decks: z.array(deckSchema).max(500).optional(),
  })
  .refine(
    (data) => data.notes || data.quizzes || data.decks,
    "Include notes, quizzes, or decks.",
  );
function exportJson(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ContentManager({
  data,
  update,
  notify,
  tab,
}: ContentProps & { tab?: string }) {
  const initial: Collection =
    tab === "quizzes" ? "quizzes" : tab === "flashcards" ? "decks" : "notes";
  const [collection, setCollection] = useState<
    Collection | "reports" | "analytics"
  >(
    tab === "reports" ? "reports" : tab === "analytics" ? "analytics" : initial,
  );
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [editingCollection, setEditingCollection] =
    useState<Collection>(initial);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  useDialog(!!deleting, () => setDeleting(null));
  const [pendingImport, setPendingImport] = useState<z.infer<
    typeof importSchema
  > | null>(null);
  const entries =
    collection === "reports" || collection === "analytics"
      ? []
      : data[collection].filter((entry) =>
          `${entry.title} ${entry.subject}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        );
  const add = () => {
    if (collection === "reports" || collection === "analytics") return;
    setEditingCollection(collection);
    const base = {
      ...academic,
      id: newId(),
      title: "",
      subject: "Computer Networks",
      published: true,
    };
    setEditing(
      collection === "notes"
        ? {
            ...base,
            summary: "",
            body: "# A new idea\n\nStart with something worth understanding.",
            kind: "Notes",
            pdfUrl: "",
            videoUrl: "",
          }
        : collection === "quizzes"
          ? {
              ...base,
              description: "",
              minutes: 10,
              questions: [
                {
                  id: newId(),
                  prompt: "",
                  options: ["", "", "", ""],
                  correct: 0,
                  explanation: "",
                },
              ],
            }
          : {
              ...base,
              description: "",
              cards: [{ id: newId(), front: "", back: "" }],
            },
    );
    setError("");
  };
  const save = (entry: Entry) => {
    const schema =
      editingCollection === "notes"
        ? noteSchema
        : editingCollection === "quizzes"
          ? quizSchema
          : deckSchema;
    const result = schema.safeParse(entry);
    if (!result.success) {
      setError(
        result.error.issues
          .map((issue) => `${issue.path.join(" → ")}: ${issue.message}`)
          .join(" · "),
      );
      return;
    }
    update((previous) => ({
      ...previous,
      [editingCollection]: previous[editingCollection].some(
        (item) => item.id === entry.id,
      )
        ? previous[editingCollection].map((item) =>
            item.id === entry.id ? result.data : item,
          )
        : [result.data, ...previous[editingCollection]],
    }));
    setEditing(null);
    setError("");
    notify("A new idea, ready to explore.");
  };
  const importContent = () => {
    if (!pendingImport) return;
    const merged = { ...data };
    for (const key of ["notes", "quizzes", "decks"] as const) {
      const incoming = pendingImport[key];
      if (incoming) {
        const map = new Map<string, Entry>(
          data[key].map((entry) => [entry.id, entry]),
        );
        incoming.forEach((entry) => map.set(entry.id, entry));
        Object.assign(merged, { [key]: [...map.values()] });
      }
    }
    const validated = workspaceSchema.safeParse(merged);
    if (!validated.success) {
      setError(
        "The imported library contains duplicate card/question IDs or exceeds workspace limits. Your saved library is unchanged.",
      );
      setPendingImport(null);
      return;
    }
    update(() => validated.data);
    setPendingImport(null);
    notify("Your library has a few new ideas.");
  };
  return (
    <>
      <PageHeading
        eyebrow="YOUR IDEAS BELONG HERE"
        title="A little studio for big ideas."
        description="Create, curate, and make your study space your own. Edits stay in this browser."
        action={
          <div className="button-group">
            <button
              className="button secondary"
              onClick={() =>
                exportJson("notes-pal-library.json", {
                  notes: data.notes,
                  quizzes: data.quizzes,
                  decks: data.decks,
                })
              }
            >
              <ArrowDownToLine size={16} />
              Export library
            </button>
            <label className="button secondary file-button">
              <Upload size={16} />
              Import JSON
              <input
                aria-label="Import content JSON"
                type="file"
                accept="application/json,.json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    if (file.size > 8_000_000)
                      throw new Error(
                        "Content file must be smaller than 8 MB.",
                      );
                    const incoming = importSchema.parse(
                      JSON.parse(await file.text()),
                    );
                    for (const key of ["notes", "quizzes", "decks"] as const) {
                      const ids = incoming[key]?.map((entry) => entry.id) || [];
                      if (new Set(ids).size !== ids.length)
                        throw new Error(
                          "Imported content contains duplicate IDs.",
                        );
                    }
                    setPendingImport(incoming);
                    setError("");
                  } catch (problem) {
                    setError(
                      problem instanceof Error
                        ? problem.message
                        : "This content file is invalid.",
                    );
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
        }
      />
      <div className="studio-note">
        <Sparkle />
        Your personal content studio. Publish here to add resources to your own
        library. Share them with a JSON export.
      </div>
      {error && !editing && (
        <p className="inline-error" role="alert">
          {error}
        </p>
      )}
      {pendingImport && (
        <div className="panel confirmation">
          <h3>Bring these ideas into your library?</h3>
          <p>
            {pendingImport.notes?.length || 0} notes ·{" "}
            {pendingImport.quizzes?.length || 0} quizzes ·{" "}
            {pendingImport.decks?.length || 0} flashcard sets. Matching IDs
            replace existing resources; progress is kept.
          </p>
          <button className="button primary" onClick={importContent}>
            Import resources
          </button>
          <button className="text-link" onClick={() => setPendingImport(null)}>
            Cancel
          </button>
        </div>
      )}
      <div className="studio-tabs">
        {[
          { key: "notes", label: "Notes", icon: BookOpen },
          { key: "quizzes", label: "Quizzes", icon: CircleHelp },
          { key: "decks", label: "Flashcards", icon: Layers3 },
          { key: "reports", label: "Feedback", icon: Flag },
          { key: "analytics", label: "Insights", icon: FileJson },
        ].map((item) => (
          <button
            key={item.key}
            className={collection === item.key ? "selected" : ""}
            onClick={() => {
              setCollection(item.key as typeof collection);
              setQuery("");
              setError("");
            }}
          >
            <item.icon size={16} />
            {item.label}
            <span>
              {item.key === "analytics"
                ? ""
                : data[item.key as Collection | "reports"].length}
            </span>
          </button>
        ))}
      </div>
      {collection === "analytics" ? (
        <div className="panel settings-panel">
          <h2>Your workspace at a glance</h2>
          <p className="muted">
            A private view of your library and learning. No tracking service
            required.
          </p>
          <div className="insights-grid">
            {[
              ["Published notes", data.notes.filter((n) => n.published).length],
              [
                "Published quizzes",
                data.quizzes.filter((n) => n.published).length,
              ],
              [
                "Published flashcard sets",
                data.decks.filter((n) => n.published).length,
              ],
              ["Quiz attempts", data.attempts.length],
              ["Conversations", data.chats.length],
              ["Open feedback", data.reports.filter((r) => !r.resolved).length],
            ].map(([label, count]) => (
              <div className="insight" key={label}>
                <span>{label}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          <h3>Subjects in your library</h3>
          {[...new Set(data.notes.map((n) => n.subject))].map((subject) => (
            <div className="subject-insight" key={subject}>
              <span>{subject}</span>
              <div className="goal-progress">
                <span
                  style={{
                    width: `${(data.notes.filter((n) => n.subject === subject).length / Math.max(1, data.notes.length)) * 100}%`,
                  }}
                />
              </div>
              <strong>
                {data.notes.filter((n) => n.subject === subject).length}
              </strong>
            </div>
          ))}
          <Link href="/history" className="text-link">
            See your learning progress <ArrowUpRight size={16} />
          </Link>
        </div>
      ) : collection === "reports" ? (
        <section className="panel settings-panel">
          <div className="section-heading">
            <h2>A few ideas to grow with</h2>
            <button
              className="button secondary"
              onClick={() =>
                exportJson("notes-pal-feedback.json", data.reports)
              }
            >
              <ArrowDownToLine size={16} />
              Export feedback
            </button>
          </div>
          {data.reports.length ? (
            data.reports.map((report) => (
              <article className="feedback-row" key={report.id}>
                <div>
                  <span className="eyebrow">
                    {new Date(report.createdAt).toLocaleDateString()} ·{" "}
                    {report.resolved ? "RESOLVED" : "OPEN"}
                  </span>
                  <p>{report.body}</p>
                  <Link
                    className="muted small"
                    href={
                      report.url.startsWith("/") && !report.url.startsWith("//")
                        ? report.url
                        : "/"
                    }
                  >
                    {report.url}
                  </Link>
                </div>
                <button
                  className="button secondary"
                  onClick={() =>
                    update((previous) => ({
                      ...previous,
                      reports: previous.reports.map((r) =>
                        r.id === report.id
                          ? { ...r, resolved: !r.resolved }
                          : r,
                      ),
                    }))
                  }
                >
                  {report.resolved ? "Reopen" : "Resolve"}
                  <Check size={15} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Delete feedback"
                  onClick={() => setDeleting(report.id)}
                >
                  <Trash2 size={16} />
                </button>
              </article>
            ))
          ) : (
            <Empty title="A little room for feedback.">
              <p>
                Use “Share feedback” in the footer to save an issue or an idea.
              </p>
            </Empty>
          )}
        </section>
      ) : (
        <section className="panel studio-table-panel">
          <div className="studio-table-toolbar">
            <div className="table-search">
              <Search size={17} />
              <input
                aria-label="Search studio resources"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a resource…"
              />
            </div>
            <button className="button primary" onClick={add}>
              <Plus size={16} />
              Create{" "}
              {collection === "notes"
                ? "note"
                : collection === "quizzes"
                  ? "quiz"
                  : "flashcard set"}
            </button>
          </div>
          <div className="table-scroll">
            <table className="studio-table">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Academic context</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <strong>{entry.title}</strong>
                      <span>{entry.subject}</span>
                    </td>
                    <td>
                      {entry.university}
                      <span>
                        {entry.degree} · Semester {entry.semester}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`subject-pill ${entry.published ? "mint" : "yellow"}`}
                      >
                        {entry.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="button small-button secondary"
                          onClick={() => {
                            setEditing(entry);
                            setEditingCollection(collection);
                            setError("");
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`Delete ${entry.title}`}
                          onClick={() => setDeleting(entry.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!entries.length && (
            <Empty title="Make room for a new idea.">
              <button className="button secondary" onClick={add}>
                Create your first resource <Plus size={16} />
              </button>
            </Empty>
          )}
        </section>
      )}
      {editing && (
        <ResourceEditor
          collection={editingCollection}
          initial={editing}
          onSave={save}
          onCancel={() => {
            setEditing(null);
            setError("");
          }}
          error={error}
        />
      )}
      {deleting && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Delete resource"
          >
            <h2>
              Remove this {collection === "reports" ? "feedback" : "resource"}?
            </h2>
            <p>
              Export a backup first if you want to keep a copy. Completed quiz
              results are preserved.
            </p>
            <div className="button-group">
              <button
                className="button danger-button"
                onClick={() => {
                  update((previous) =>
                    collection === "reports"
                      ? {
                          ...previous,
                          reports: previous.reports.filter(
                            (r) => r.id !== deleting,
                          ),
                        }
                      : collection === "analytics"
                        ? previous
                        : {
                            ...previous,
                            [collection]: previous[collection].filter(
                              (entry) => entry.id !== deleting,
                            ),
                            ...(collection === "notes"
                              ? {
                                  bookmarks: previous.bookmarks.filter(
                                    (id) => id !== deleting,
                                  ),
                                }
                              : {}),
                          },
                  );
                  setDeleting(null);
                  notify("Removed from your workspace.");
                }}
              >
                Remove
              </button>
              <button
                className="button secondary"
                onClick={() => setDeleting(null)}
              >
                Keep it
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
function Sparkle() {
  return <span aria-hidden="true">✦</span>;
}
function ResourceEditor({
  collection,
  initial,
  onSave,
  onCancel,
  error,
}: {
  collection: Collection;
  initial: Entry;
  onSave: (value: Entry) => void;
  onCancel: () => void;
  error: string;
}) {
  const [entry, setEntry] = useState<Entry>(
    JSON.parse(JSON.stringify(initial)),
  );
  const [preview, setPreview] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const changed = JSON.stringify(entry) !== JSON.stringify(initial);
  useDialog(true, () => (changed ? setConfirmClose(true) : onCancel()));
  const patch = (fields: Partial<Entry>) =>
    setEntry((previous) => ({ ...previous, ...fields }));
  const note = "body" in entry ? entry : null;
  const quiz = "questions" in entry ? entry : null;
  const deck = "cards" in entry ? entry : null;
  return (
    <div className="modal-backdrop editor-backdrop">
      <section
        className="editor modal"
        role="dialog"
        aria-modal="true"
        aria-label="Edit resource"
      >
        <div className="editor-header">
          <div>
            <span className="eyebrow">CONTENT STUDIO</span>
            <h2>
              {initial.title
                ? "A little fine-tuning."
                : "Something worth sharing."}
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close editor"
            onClick={() => (changed ? setConfirmClose(true) : onCancel())}
          >
            <X size={21} />
          </button>
        </div>
        {confirmClose && (
          <div className="confirmation">
            <p>Discard your unsaved edits?</p>
            <button className="button secondary" onClick={onCancel}>
              Discard edits
            </button>
            <button
              className="text-link"
              onClick={() => setConfirmClose(false)}
            >
              Keep editing
            </button>
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(entry);
          }}
        >
          <div className="editor-scroll">
            <div className="form-grid">
              <label className="field">
                <span>Title</span>
                <input
                  required
                  maxLength={200}
                  autoFocus
                  value={entry.title}
                  onChange={(e) => patch({ title: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Subject</span>
                <input
                  required
                  maxLength={120}
                  value={entry.subject}
                  onChange={(e) => patch({ subject: e.target.value })}
                />
              </label>
            </div>
            <div className="form-grid academic-editor">
              <AcademicFields
                value={entry}
                onChange={(next) => patch(next as Academic)}
              />
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={entry.published}
                onChange={(e) => patch({ published: e.target.checked })}
              />
              Published in my library
            </label>
            {note && (
              <>
                <div className="form-grid">
                  <label className="field">
                    <span>Resource type</span>
                    <select
                      value={note.kind}
                      onChange={(e) =>
                        patch({ kind: e.target.value as Note["kind"] })
                      }
                    >
                      {kinds.map((kind) => (
                        <option key={kind}>{kind}</option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>PDF URL (optional)</span>
                    <input
                      placeholder="https://… or /materials/…"
                      value={note.pdfUrl.startsWith("data:") ? "" : note.pdfUrl}
                      onChange={(e) => patch({ pdfUrl: e.target.value })}
                    />
                  </label>
                </div>
                <label className="field">
                  <span>Summary / syllabus</span>
                  <textarea
                    maxLength={2000}
                    rows={2}
                    value={note.summary}
                    onChange={(e) => patch({ summary: e.target.value })}
                  />
                </label>
                <div className="form-grid">
                  <label className="field">
                    <span>Video URL (optional)</span>
                    <input
                      placeholder="https://www.youtube.com/watch?v=…"
                      value={note.videoUrl}
                      onChange={(e) => patch({ videoUrl: e.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Or attach a PDF (up to 1 MB)</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 1_000_000) {
                          setUploadError(
                            "Choose a PDF smaller than 1 MB, or use a hosted PDF URL.",
                          );
                          return;
                        }
                        const header = new TextDecoder().decode(
                          await file.slice(0, 5).arrayBuffer(),
                        );
                        if (header !== "%PDF-") {
                          setUploadError("Choose a valid PDF file.");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          patch({
                            pdfUrl:
                              "data:application/pdf;base64," +
                              String(reader.result).split(",")[1],
                          });
                          setUploadError("");
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    {note.pdfUrl.startsWith("data:") && (
                      <small>
                        PDF attached.{" "}
                        <button
                          type="button"
                          className="text-link"
                          onClick={() => patch({ pdfUrl: "" })}
                        >
                          Remove attachment
                        </button>
                      </small>
                    )}
                  </label>
                </div>
                {uploadError && <p className="inline-error">{uploadError}</p>}
                <div className="section-heading">
                  <label className="field-label" htmlFor="note-body">
                    Note content
                  </label>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setPreview(!preview)}
                  >
                    {preview ? "Edit markdown" : "Preview note"}
                    <ArrowUpRight size={14} />
                  </button>
                </div>
                {preview ? (
                  <div className="editor-preview">
                    <Markdown>{note.body}</Markdown>
                  </div>
                ) : (
                  <textarea
                    id="note-body"
                    className="code-editor"
                    rows={16}
                    maxLength={100000}
                    value={note.body}
                    onChange={(e) => patch({ body: e.target.value })}
                  />
                )}
                <p className="muted small">
                  Markdown supports headings, tables, code blocks, images,
                  links, and LaTeX with $…$ or $$…$$.
                </p>
              </>
            )}
            {quiz && (
              <>
                <label className="field">
                  <span>Description</span>
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={quiz.description}
                    onChange={(e) => patch({ description: e.target.value })}
                  />
                </label>
                <label className="field narrow">
                  <span>Time limit (minutes)</span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={180}
                    value={quiz.minutes}
                    onChange={(e) => patch({ minutes: Number(e.target.value) })}
                  />
                </label>
                <h3>Questions</h3>
                {quiz.questions.map((question, index) => (
                  <div className="nested-editor" key={question.id}>
                    <div className="section-heading">
                      <span className="eyebrow">QUESTION {index + 1}</span>
                      <button
                        type="button"
                        className="icon-button"
                        disabled={quiz.questions.length === 1}
                        aria-label={`Remove question ${index + 1}`}
                        onClick={() =>
                          patch({
                            questions: quiz.questions.filter(
                              (q) => q.id !== question.id,
                            ),
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <label className="field">
                      <span>Question</span>
                      <textarea
                        required
                        rows={2}
                        value={question.prompt}
                        onChange={(e) =>
                          patch({
                            questions: quiz.questions.map((q) =>
                              q.id === question.id
                                ? { ...q, prompt: e.target.value }
                                : q,
                            ),
                          })
                        }
                      />
                    </label>
                    <span className="muted small">
                      Select the correct answer.
                    </span>
                    {question.options.map((option, i) => (
                      <label className="option-editor" key={i}>
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          aria-label={`Option ${i + 1} is correct`}
                          checked={question.correct === i}
                          onChange={() =>
                            patch({
                              questions: quiz.questions.map((q) =>
                                q.id === question.id ? { ...q, correct: i } : q,
                              ),
                            })
                          }
                        />
                        <input
                          aria-label={`Question ${index + 1} option ${i + 1}`}
                          required
                          value={option}
                          onChange={(e) =>
                            patch({
                              questions: quiz.questions.map((q) =>
                                q.id === question.id
                                  ? {
                                      ...q,
                                      options: q.options.map((o, j) =>
                                        j === i ? e.target.value : o,
                                      ),
                                    }
                                  : q,
                              ),
                            })
                          }
                        />
                      </label>
                    ))}
                    <label className="field">
                      <span>Explanation</span>
                      <textarea
                        rows={2}
                        value={question.explanation}
                        onChange={(e) =>
                          patch({
                            questions: quiz.questions.map((q) =>
                              q.id === question.id
                                ? { ...q, explanation: e.target.value }
                                : q,
                            ),
                          })
                        }
                      />
                    </label>
                  </div>
                ))}
                <button
                  type="button"
                  className="button secondary"
                  disabled={quiz.questions.length >= 100}
                  onClick={() =>
                    patch({
                      questions: [
                        ...quiz.questions,
                        {
                          id: newId(),
                          prompt: "",
                          options: ["", "", "", ""],
                          correct: 0,
                          explanation: "",
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Add question
                </button>
              </>
            )}
            {deck && (
              <>
                <label className="field">
                  <span>Description</span>
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={deck.description}
                    onChange={(e) => patch({ description: e.target.value })}
                  />
                </label>
                <h3>Your flashcards</h3>
                {deck.cards.map((card, index) => (
                  <div className="nested-editor" key={card.id}>
                    <div className="section-heading">
                      <span className="eyebrow">CARD {index + 1}</span>
                      <button
                        type="button"
                        className="icon-button"
                        aria-label={`Remove card ${index + 1}`}
                        disabled={deck.cards.length === 1}
                        onClick={() =>
                          patch({
                            cards: deck.cards.filter((c) => c.id !== card.id),
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="form-grid">
                      <label className="field">
                        <span>Front · a good question</span>
                        <textarea
                          required
                          rows={3}
                          value={card.front}
                          onChange={(e) =>
                            patch({
                              cards: deck.cards.map((c) =>
                                c.id === card.id
                                  ? { ...c, front: e.target.value }
                                  : c,
                              ),
                            })
                          }
                        />
                      </label>
                      <label className="field">
                        <span>Back · the lightbulb moment</span>
                        <textarea
                          required
                          rows={3}
                          value={card.back}
                          onChange={(e) =>
                            patch({
                              cards: deck.cards.map((c) =>
                                c.id === card.id
                                  ? { ...c, back: e.target.value }
                                  : c,
                              ),
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="button secondary"
                  disabled={deck.cards.length >= 500}
                  onClick={() =>
                    patch({
                      cards: [
                        ...deck.cards,
                        { id: newId(), front: "", back: "" },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Add card
                </button>
              </>
            )}
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="editor-footer">
            <button
              type="button"
              className="button secondary"
              onClick={() => (changed ? setConfirmClose(true) : onCancel())}
            >
              Cancel
            </button>
            <button type="submit" className="button primary">
              <Save size={16} />
              Save{" "}
              {collection === "notes"
                ? "note"
                : collection === "quizzes"
                  ? "quiz"
                  : "study set"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
