"use client";

import Link from "next/link";
import { useDialog } from "@/hooks/use-dialog";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Moon,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Sun,
  Target,
  Trash2,
  X,
  Layers3,
  CircleHelp,
  BarChart3,
  Flag,
  Share2,
  Upload,
  Play,
  Send,
  RotateCcw,
  Pencil,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  answerAttempt,
  createWorkspace,
  filterContent,
  finishAttempt,
  kinds,
  newId,
  parseBackup,
  startAttempt,
  storageKey,
  videoEmbed,
  type Academic,
  type Attempt,
  type Chat,
  type Workspace as WorkspaceData,
} from "@/lib/workspace";
import { ContentManager } from "@/components/content-manager";

export type UpdateWorkspace = (
  update: (previous: WorkspaceData) => WorkspaceData,
) => void;
const navigation = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/notes", label: "Study notes", icon: BookOpen },
  { href: "/quiz", label: "Practice quizzes", icon: CircleHelp },
  { href: "/flashcards", label: "Flashcards", icon: Layers3 },
  { href: "/ai", label: "AI companion", icon: Sparkles },
];
const subjectColors: Record<string, string> = {
  "Computer Networks": "peach",
  "Software Engineering": "lavender",
  "Theory of Computation": "mint",
  "Compiler Design": "blue",
  "Computer Graphics": "yellow",
};
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
export function Empty({
  icon: Icon = BookOpen,
  title,
  children,
}: {
  icon?: typeof BookOpen;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon size={28} />
      </span>
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function AcademicFields({
  value,
  onChange,
  all = false,
}: {
  value: Partial<Academic>;
  onChange: (value: Partial<Academic>) => void;
  all?: boolean;
}) {
  const options = {
    university: ["AKTU", "ABES EC"],
    degree: ["B.Tech CSE", "B.Tech IT"],
    year: ["1", "2", "3", "4"],
    semester: ["1", "2", "3", "4", "5", "6", "7", "8"],
  };
  return (
    <>
      {(Object.keys(options) as (keyof Academic)[]).map((key) => (
        <label className="field" key={key}>
          <span>{key[0].toUpperCase() + key.slice(1)}</span>
          <select
            value={value[key] || "all"}
            onChange={(e) => {
              const next = { ...value, [key]: e.target.value };
              if (key === "year" && e.target.value !== "all")
                next.semester = String(
                  Number(e.target.value) * 2 - 1,
                ) as Academic["semester"];
              onChange(next);
            }}
          >
            {all && (
              <option value="all">
                All {key === "university" ? "universities" : key + "s"}
              </option>
            )}
            {options[key].map((option) => (
              <option key={option} value={option}>
                {key === "year"
                  ? `Year ${option}`
                  : key === "semester"
                    ? `Semester ${option}`
                    : option}
              </option>
            ))}
          </select>
        </label>
      ))}
    </>
  );
}
export default function Workspace({ route }: { route: string[] }) {
  const router = useRouter();
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [storageError, setStorageError] = useState("");
  const [blockedStorage, setBlockedStorage] = useState(false);
  const [toast, setToast] = useState("");
  const [mobile, setMobile] = useState(false);
  const [report, setReport] = useState(false);
  const [reportBody, setReportBody] = useState("");
  useDialog(report, () => setReport(false));
  const [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notify = useCallback((message: string) => {
    setToast(message);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 4500);
  }, []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setData(saved ? parseBackup(saved) : createWorkspace());
    } catch {
      setStorageError(
        "Your saved workspace could not be loaded. Download the saved data before restoring a backup or starting fresh.",
      );
      setBlockedStorage(true);
      setData(createWorkspace());
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (!data) return;
    document.documentElement.dataset.theme = data.theme;
  }, [data]);
  useEffect(() => {
    if (!data || blockedStorage) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      setStorageError(
        "Your browser could not save changes. Export a backup in Preferences before leaving this page.",
      );
    }
  }, [data, blockedStorage]);
  const routeKey = route.join("/");
  useEffect(() => {
    setMobile(false);
    setSearch("");
  }, [routeKey]);
  const update: UpdateWorkspace = useCallback(
    (fn) => setData((previous) => (previous ? fn(previous) : previous)),
    [],
  );
  const section = route[0] || "overview";
  const activeSection = [
    "notes",
    "quiz",
    "flashcards",
    "ai",
    "profile",
    "admin",
    "saved",
    "history",
  ].includes(section)
    ? section
    : "overview";
  if (!data)
    return (
      <div className="loading-screen">
        <div className="brand-mark">
          <BookOpen />
        </div>
        <p>Opening your study space…</p>
      </div>
    );
  const savedNotes = data.notes.filter(
    (note) => data.bookmarks.includes(note.id) && note.published,
  );
  const completed = data.attempts.filter(
    (attempt) => attempt.completedAt !== null,
  );
  const toggleBookmark = (id: string) =>
    update((d) => ({
      ...d,
      bookmarks: d.bookmarks.includes(id)
        ? d.bookmarks.filter((item) => item !== id)
        : [...d.bookmarks, id],
    }));
  const name =
    data.profile.name === "Learner" ? "there" : data.profile.name.split(" ")[0];
  const contentProps = { data, update, notify };
  let content: ReactNode;
  if (section === "notes" && route[1])
    content = (
      <NoteReader
        {...contentProps}
        id={route[1]}
        toggleBookmark={toggleBookmark}
        onReport={() => setReport(true)}
      />
    );
  else if (section === "notes" || section === "saved")
    content = (
      <LibraryView
        {...contentProps}
        query={search}
        setQuery={setSearch}
        savedOnly={section === "saved"}
        toggleBookmark={toggleBookmark}
      />
    );
  else if (section === "quiz" && route[1])
    content = <QuizRunner key={route[1]} {...contentProps} id={route[1]} />;
  else if (section === "quiz")
    content = <PracticeLibrary {...contentProps} mode="quiz" query={search} />;
  else if (section === "flashcards" && route[1])
    content = (
      <FlashcardRunner key={route[1]} {...contentProps} id={route[1]} />
    );
  else if (section === "flashcards")
    content = (
      <PracticeLibrary {...contentProps} mode="flashcards" query={search} />
    );
  else if (section === "ai") content = <AICompanion {...contentProps} />;
  else if (section === "profile")
    content = (
      <Preferences
        {...contentProps}
        recover={() => {
          setBlockedStorage(false);
          setStorageError("");
        }}
      />
    );
  else if (section === "admin" || section === "studio")
    content = <ContentManager {...contentProps} tab={route[1]} />;
  else if (section === "history") content = <History {...contentProps} />;
  else if (
    ["premium", "sign-in", "onboarding", "blocked", "failed"].includes(section)
  )
    content = (
      <div className="panel welcome-free">
        <Sparkles size={36} />
        <h1>You’re already in.</h1>
        <p>
          Every study tool is free to use. Choose a subject and make a little
          progress.
        </p>
        <Link className="button primary" href="/notes">
          Explore study notes <ArrowRight size={17} />
        </Link>
      </div>
    );
  else if (
    [
      "about",
      "contact",
      "privacy",
      "terms",
      "refund",
      "shipping",
      "anti-piracy",
      "report",
    ].includes(section)
  )
    content = <InfoPage section={section} onReport={() => setReport(true)} />;
  else if (route.length)
    content = (
      <Empty title="This page has moved.">
        <Link href="/">Go to your overview →</Link>
      </Empty>
    );
  else
    content = (
      <>
        <PageHeading
          eyebrow="YOUR PERSONAL STUDY SPACE"
          title={`A little focus. A lot of progress.`}
          description={`Hey ${name}, ready to learn something new today?`}
          action={
            <span className="date-pill">
              <span className="status-dot" />
              All tools, always free
            </span>
          }
        />
        <section className="hero-grid">
          <div className="hero-banner">
            <div className="hero-copy">
              <span className="small-tag">
                <Sparkles size={13} />
                MAKE ROOM FOR YOUR NEXT BIG IDEA
              </span>
              <h2>
                Small steps.
                <br />
                Brighter futures<span>.</span>
              </h2>
              <p>
                Your notes, practice, and a little curiosity.
                <br />
                Everything you need to find your flow.
              </p>
              <Link className="button ink" href="/notes">
                Let’s get learning <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="study-art" aria-hidden="true">
              <span className="art-spark spark-one">✦</span>
              <span className="art-spark spark-two">✧</span>
              <span className="art-orbit" />
              <div className="art-card art-card-back">
                <span />
                <span />
                <span />
              </div>
              <div className="art-card art-card-front">
                <BookOpen size={51} strokeWidth={1.3} />
                <b>
                  ONE PAGE
                  <br />
                  AT A TIME.
                </b>
                <div className="art-line" />
              </div>
              <span className="art-label">you’ve got this ↗</span>
              <span className="art-star">✳</span>
            </div>
          </div>
          <div className="goal-card panel">
            <div className="section-title">
              <span className="icon-tile mint">
                <Target size={20} />
              </span>
              <span className="eyebrow">DAILY INTENTION</span>
            </div>
            <h3>Show up for yourself.</h3>
            <p>A few focused moments can go a long way.</p>
            <DailyGoal data={data} />
            <Link href="/profile" className="text-link">
              Set your study goal <ArrowUpRight size={15} />
            </Link>
          </div>
        </section>
        <div className="stats-row">
          <Stat
            icon={BookOpen}
            label="Notes explored"
            value={Object.keys(data.completedNotes).length}
            detail={`${data.notes.filter((n) => n.published).length} waiting for you`}
            color="peach"
          />
          <Stat
            icon={CircleHelp}
            label="Quizzes completed"
            value={completed.length}
            detail={
              completed.length
                ? `${Math.round((completed.reduce((sum, a) => sum + a.score / a.questions.length, 0) / completed.length) * 100)}% average accuracy`
                : "Your next challenge awaits"
            }
            color="lavender"
          />
          <Stat
            icon={Layers3}
            label="Cards reviewed"
            value={Object.values(data.reviews).reduce(
              (sum, r) => sum + r.reviewed.length,
              0,
            )}
            detail="Little by little, it sticks"
            color="mint"
          />
        </div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">PICK UP SOMETHING GOOD</p>
            <h2>Your study toolkit</h2>
          </div>
          <span className="muted small">A way to learn for every mood.</span>
        </div>
        <div className="toolkit-grid">
          {[
            {
              name: "Study notes",
              text: "Big concepts, made a little clearer.",
              href: "/notes",
              icon: BookOpen,
              color: "peach",
              label: `${data.notes.filter((n) => n.published).length} resources`,
            },
            {
              name: "Practice quizzes",
              text: "A small challenge. A stronger you.",
              href: "/quiz",
              icon: CircleHelp,
              color: "lavender",
              label: `${data.quizzes.filter((q) => q.published).length} quizzes`,
            },
            {
              name: "Flashcards",
              text: "Flip a card. Make it click.",
              href: "/flashcards",
              icon: Layers3,
              color: "mint",
              label: `${data.decks.filter((d) => d.published).length} study sets`,
            },
            {
              name: "AI companion",
              text: "A curious question is a great start.",
              href: "/ai",
              icon: Sparkles,
              color: "yellow",
              label: "Here to help",
            },
          ].map((tool) => (
            <Link
              key={tool.name}
              href={tool.href}
              className={`tool-card ${tool.color}`}
            >
              <div className="tool-top">
                <span className="tool-icon">
                  <tool.icon size={23} />
                </span>
                <ArrowUpRight size={19} />
              </div>
              <h3>{tool.name}</h3>
              <p>{tool.text}</p>
              <span className="tool-label">
                {tool.label}
                <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
        <div className="bottom-grid">
          <section>
            <div className="section-heading">
              <div>
                <p className="eyebrow">A GOOD PLACE TO BEGIN</p>
                <h2>On your reading list</h2>
              </div>
              <Link className="text-link" href="/notes">
                View all notes <ArrowRight size={16} />
              </Link>
            </div>
            <div className="reading-list">
              {data.notes
                .filter((n) => n.published)
                .slice(0, 3)
                .map((note, index) => (
                  <Link
                    className="reading-row"
                    href={`/notes/${note.id}`}
                    key={note.id}
                  >
                    <span
                      className={`reading-icon ${subjectColors[note.subject] || "peach"}`}
                    >
                      <FileText size={21} />
                    </span>
                    <div>
                      <span className="eyebrow">{note.subject}</span>
                      <h3>{note.title.replace(/^Unit \d+: /, "")}</h3>
                      <span className="muted small">
                        Unit {index + 1} <span className="dot-divider">·</span>{" "}
                        {readingMinutes(note.body)} min read
                      </span>
                    </div>
                    <ArrowUpRight size={19} />
                  </Link>
                ))}
            </div>
          </section>
          <section className="thought-card">
            <span className="thought-star">✳</span>
            <p className="eyebrow">A LITTLE REMINDER</p>
            <blockquote>
              “You don’t have to be great to start.
              <br />
              But you have to start to be great.”
            </blockquote>
            <p className="muted small">
              One concept. One page. One step forward.
            </p>
            <span className="thought-signature">Keep going, pal.</span>
          </section>
        </div>
      </>
    );
  return (
    <div className="app-shell">
      <button
        className={`sidebar-scrim ${mobile ? "visible" : ""}`}
        aria-label="Close navigation"
        onClick={() => setMobile(false)}
      />
      <aside className={`sidebar ${mobile ? "is-open" : ""}`}>
        <Link href="/" className="brand">
          <span className="brand-mark">
            <BookOpen size={24} />
          </span>
          <span>
            notes<span className="brand-light">pal</span>
            <i>✦</i>
          </span>
        </Link>
        <span className="workspace-label">A SPACE TO GROW</span>
        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              className={`nav-item ${activeSection === (item.href === "/" ? "overview" : item.href.slice(1)) ? "active" : ""}`}
              href={item.href}
            >
              <item.icon size={19} />
              {item.label}
              {item.href === "/ai" && <span className="nav-new">AI</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <p className="nav-caption">YOUR CORNER</p>
        <nav aria-label="Your workspace">
          <Link
            className={`nav-item ${section === "saved" ? "active" : ""}`}
            href="/saved"
          >
            <Bookmark size={18} />
            Saved notes
            {savedNotes.length > 0 && (
              <span className="nav-count">{savedNotes.length}</span>
            )}
          </Link>
          <Link
            className={`nav-item ${section === "history" ? "active" : ""}`}
            href="/history"
          >
            <BarChart3 size={18} />
            My progress
          </Link>
          <Link
            className={`nav-item ${section === "admin" ? "active" : ""}`}
            href="/admin"
          >
            <Settings2 size={18} />
            Content studio
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span>✧</span>
            <p>
              A little better,
              <br />
              <strong>every single day.</strong>
            </p>
            <div className="scribble">↝</div>
          </div>
          <Link className="profile-link" href="/profile">
            <span className="avatar">
              {data.profile.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{data.profile.name}</strong>
              <span>Your learning journey</span>
            </div>
            <Settings2 size={17} />
          </Link>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-location">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={22} />
            </button>
            <span className="muted">Workspace</span>
            <ChevronRight size={14} />
            <strong>
              {section === "overview"
                ? "Overview"
                : section === "admin"
                  ? "Content studio"
                  : section === "profile"
                    ? "Preferences"
                    : navigation.find((n) => n.href === `/${section}`)?.label ||
                      section[0].toUpperCase() + section.slice(1)}
            </strong>
          </div>
          <div className="topbar-actions">
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/notes?q=${encodeURIComponent(search)}`);
              }}
            >
              <Search size={16} />
              <input
                aria-label="Search all notes"
                placeholder="Find a little inspiration…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd>↵</kbd>
            </form>
            <button
              className="icon-button theme-toggle"
              title="Switch color theme"
              aria-label="Switch color theme"
              onClick={() =>
                update((d) => ({
                  ...d,
                  theme: d.theme === "light" ? "dark" : "light",
                }))
              }
            >
              {data.theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link
              href="/profile"
              className="avatar small-avatar"
              aria-label="Open preferences"
            >
              {data.profile.name.slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </header>
        <main className="main-content">
          {storageError && (
            <div role="alert" className="storage-warning">
              {storageError}
              <Link href="/profile">Open recovery tools →</Link>
            </div>
          )}
          {content}
          <footer className="footer">
            <span>
              Made for curious minds. <span className="footer-flower">✳</span>
            </span>
            <div>
              <Link href="/about">About Notes Pal</Link>
              <button onClick={() => setReport(true)}>
                Share feedback <ArrowUpRight size={12} />
              </button>
            </div>
          </footer>
        </main>
      </div>
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {report && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Share feedback"
          >
            <div className="section-heading">
              <h2>Help this space grow.</h2>
              <button
                className="icon-button"
                aria-label="Close feedback"
                onClick={() => setReport(false)}
              >
                <X />
              </button>
            </div>
            <p className="muted">
              Save an issue or idea to your workspace. You can review and export
              feedback in Content studio.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!reportBody.trim()) return;
                update((d) => ({
                  ...d,
                  reports: [
                    {
                      id: newId(),
                      title: document.title,
                      url: window.location.pathname,
                      body: reportBody.trim(),
                      createdAt: Date.now(),
                      resolved: false,
                    },
                    ...d.reports,
                  ],
                }));
                setReportBody("");
                setReport(false);
                notify("Feedback saved to your workspace.");
              }}
            >
              <label className="field">
                <span>Your feedback</span>
                <textarea
                  autoFocus
                  required
                  maxLength={4000}
                  rows={5}
                  value={reportBody}
                  onChange={(e) => setReportBody(e.target.value)}
                  placeholder="Something missing? A concept that needs a clearer explanation?"
                />
              </label>
              <button className="button primary" type="submit">
                Save feedback <ArrowRight size={16} />
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
function readingMinutes(body: string) {
  return Math.max(1, Math.ceil(body.split(/\s+/).length / 180));
}
function Stat({
  icon: Icon,
  label,
  value,
  detail,
  color,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
  detail: string;
  color: string;
}) {
  return (
    <div className="stat-card panel">
      <span className={`icon-tile ${color}`}>
        <Icon size={21} />
      </span>
      <div>
        <span className="muted small">{label}</span>
        <div className="stat-value">
          {value}
          <span>{detail}</span>
        </div>
      </div>
    </div>
  );
}
function DailyGoal({ data }: { data: WorkspaceData }) {
  const today = new Date().toDateString();
  const count =
    Object.values(data.completedNotes).filter(
      (time) => new Date(time).toDateString() === today,
    ).length +
    data.attempts.filter(
      (a) => a.completedAt && new Date(a.completedAt).toDateString() === today,
    ).length +
    Object.values(data.reviews).filter(
      (r) => r.finishedAt && new Date(r.finishedAt).toDateString() === today,
    ).length;
  return (
    <div className="daily-goal">
      <div
        className="goal-progress"
        role="progressbar"
        aria-label="Daily study goal"
        aria-valuenow={Math.min(count, data.profile.goal)}
        aria-valuemin={0}
        aria-valuemax={data.profile.goal}
      >
        <span
          style={{
            width: `${Math.min(100, (count / data.profile.goal) * 100)}%`,
          }}
        />
      </div>
      <div className="goal-caption">
        <strong>
          {count} <span>/ {data.profile.goal} study activities</span>
        </strong>
        <span>
          {count >= data.profile.goal ? "You did it! ✨" : "One step at a time"}
        </span>
      </div>
    </div>
  );
}
export type ContentProps = {
  data: WorkspaceData;
  update: UpdateWorkspace;
  notify: (message: string) => void;
};
function LibraryView({
  data,
  notify,
  query,
  setQuery,
  savedOnly,
  toggleBookmark,
}: ContentProps & {
  query: string;
  setQuery: (q: string) => void;
  savedOnly: boolean;
  toggleBookmark: (id: string) => void;
}) {
  const [filters, setFilters] = useState<
    Partial<Academic> & { subject?: string }
  >({});
  const [kind, setKind] = useState("All resources");
  const [limit, setLimit] = useState(9);
  const [sort, setSort] = useState("recommended");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, [setQuery]);
  let notes = filterContent(data.notes, query, filters).filter(
    (n) =>
      (!savedOnly || data.bookmarks.includes(n.id)) &&
      (kind === "All resources" || n.kind === kind),
  );
  if (sort === "title")
    notes = [...notes].sort((a, b) => a.title.localeCompare(b.title));
  return (
    <>
      <PageHeading
        eyebrow={
          savedOnly ? "YOUR PERSONAL COLLECTION" : "GOOD IDEAS START HERE"
        }
        title={
          savedOnly ? "For a curious day." : "A world of notes. A clearer mind."
        }
        description={
          savedOnly
            ? "All the ideas you’ve kept for later, in one little place."
            : "Find your subject, settle in, and let the learning begin."
        }
        action={
          <Link className="button secondary" href="/admin/notes">
            <Plus size={16} />
            Add a note
          </Link>
        }
      />
      <div className="filter-panel panel">
        <div className="filter-search">
          <Search size={19} />
          <input
            aria-label="Search study notes"
            placeholder="Search a topic, title, or subject…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(9);
            }}
          />
          <span className="muted small">{notes.length} resources</span>
        </div>
        <div className="filter-fields">
          <AcademicFields
            all
            value={filters}
            onChange={(next) => {
              setFilters(next);
              setLimit(9);
            }}
          />
          <label className="field">
            <span>Subject</span>
            <select
              value={filters.subject || "all"}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
            >
              <option value="all">All subjects</option>
              {[...new Set(data.notes.map((n) => n.subject))].map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <div className="tabs-row">
        <div className="resource-tabs">
          {["All resources", ...kinds].map((tab) => (
            <button
              key={tab}
              className={kind === tab ? "selected" : ""}
              onClick={() => {
                setKind(tab);
                setLimit(9);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <label className="sort-label">
          Sort{" "}
          <select
            aria-label="Sort notes"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>
      {notes.length ? (
        <>
          <div className="notes-grid">
            {notes.slice(0, limit).map((note) => (
              <article className="note-card panel" key={note.id}>
                <div
                  className={`note-cover ${subjectColors[note.subject] || "peach"}`}
                >
                  <span className="eyebrow">{note.kind}</span>
                  <span className="cover-art" aria-hidden="true">
                    {note.subject === "Computer Networks" ? (
                      <>
                        <span>◎</span>
                        <i>↗</i>
                      </>
                    ) : note.subject === "Software Engineering" ? (
                      <Code2 size={68} strokeWidth={1} />
                    ) : note.subject === "Theory of Computation" ? (
                      <span>
                        Σ<span className="tiny-art">ε</span>
                      </span>
                    ) : (
                      <span>✳</span>
                    )}
                  </span>
                  <span className="cover-unit">SEM {note.semester}</span>
                </div>
                <div className="note-card-body">
                  <div className="card-kicker">
                    <span>{note.subject}</span>
                    <button
                      className={`icon-button ${data.bookmarks.includes(note.id) ? "bookmarked" : ""}`}
                      aria-label={`${data.bookmarks.includes(note.id) ? "Unsave" : "Save"} ${note.title}`}
                      onClick={() => {
                        toggleBookmark(note.id);
                        notify(
                          data.bookmarks.includes(note.id)
                            ? "Removed from saved notes."
                            : "Kept for a curious day.",
                        );
                      }}
                    >
                      <Bookmark
                        size={18}
                        fill={
                          data.bookmarks.includes(note.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                  <Link href={`/notes/${note.id}`}>
                    <h3>{note.title}</h3>
                  </Link>
                  <p>{note.summary}</p>
                  <div className="note-meta">
                    <span>
                      <Clock3 size={13} />
                      {readingMinutes(note.body)} min read
                    </span>
                    <span>
                      {data.completedNotes[note.id] ? (
                        <>
                          <Check size={14} />
                          Read
                        </>
                      ) : (
                        note.university
                      )}
                    </span>
                  </div>
                  <Link href={`/notes/${note.id}`} className="card-open">
                    Open note <ArrowUpRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {limit < notes.length && (
            <div className="center">
              <button
                className="button secondary"
                onClick={() => setLimit(limit + 9)}
              >
                A few more ideas <ChevronDown size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <Empty
          title={
            savedOnly
              ? "Keep something for later."
              : "A little more room to explore."
          }
        >
          <p>
            {savedOnly
              ? "Tap the bookmark on a note to add it to your collection."
              : "Try another search or clear your filters."}
          </p>
          <button
            className="button secondary"
            onClick={() => {
              setFilters({});
              setKind("All resources");
              setQuery("");
            }}
          >
            Clear filters
          </button>
        </Empty>
      )}
    </>
  );
}
function NoteReader({
  data,
  update,
  notify,
  id,
  toggleBookmark,
  onReport,
}: ContentProps & {
  id: string;
  toggleBookmark: (id: string) => void;
  onReport: () => void;
}) {
  const note = data.notes.find((n) => n.id === id && n.published);
  const [fontSize, setFontSize] = useState(17);
  const [pdfHref, setPdfHref] = useState("");
  useEffect(() => {
    const value = note?.pdfUrl || "";
    if (!value.startsWith("data:application/pdf;base64,")) {
      setPdfHref(value);
      return;
    }
    const bytes = Uint8Array.from(atob(value.split(",")[1]), (character) =>
      character.charCodeAt(0),
    );
    const url = URL.createObjectURL(
      new Blob([bytes], { type: "application/pdf" }),
    );
    setPdfHref(url);
    return () => URL.revokeObjectURL(url);
  }, [note?.pdfUrl]);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handle = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 100);
    };
    window.addEventListener("scroll", handle);
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, []);
  if (!note)
    return (
      <Empty title="This note isn’t on the shelf yet.">
        <Link href="/notes">Explore the library →</Link>
      </Empty>
    );
  const headings = note.body
    .split("\n")
    .filter((line) => /^#{1,3} /.test(line));
  const related = data.notes.filter(
    (n) => n.id !== id && n.subject === note.subject && n.published,
  );
  const embed = videoEmbed(note.videoUrl);
  return (
    <>
      <div className="reading-progress" style={{ width: `${progress}%` }} />
      <Link className="back-link" href="/notes">
        <ArrowLeft size={16} />
        Back to study notes
      </Link>
      <div className="reader-header">
        <span
          className={`subject-pill ${subjectColors[note.subject] || "peach"}`}
        >
          {note.subject}
        </span>
        <h1>{note.title}</h1>
        <p>{note.summary}</p>
        <div className="reader-toolbar">
          <span>
            {note.university} <span className="dot-divider">·</span> Semester{" "}
            {note.semester} <span className="dot-divider">·</span>{" "}
            {readingMinutes(note.body)} min read
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Decrease font size"
              onClick={() => setFontSize(Math.max(14, fontSize - 1))}
            >
              A−
            </button>
            <button
              className="icon-button"
              aria-label="Increase font size"
              onClick={() => setFontSize(Math.min(24, fontSize + 1))}
            >
              A+
            </button>
            <button
              className="icon-button"
              aria-label="Save note"
              onClick={() => toggleBookmark(id)}
            >
              <Bookmark
                size={18}
                fill={data.bookmarks.includes(id) ? "currentColor" : "none"}
              />
            </button>
            <button
              className="icon-button"
              aria-label="Share note"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  notify(
                    "Note link copied. Custom notes need a workspace export to share.",
                  );
                } catch {
                  notify(
                    "Copy the address from your browser to share this note.",
                  );
                }
              }}
            >
              <Share2 size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Report an issue"
              onClick={onReport}
            >
              <Flag size={17} />
            </button>
          </div>
        </div>
      </div>
      <div className="reader-grid">
        <aside className="contents-nav">
          <span className="eyebrow">ON THIS PAGE</span>
          {headings.map((heading, index) => (
            <a key={index} href={`#section-${index}`}>
              {heading.replace(/^#+ /, "")}
            </a>
          ))}
        </aside>
        <article className="reader-content panel" style={{ fontSize }}>
          {note.pdfUrl && (
            <div className="attachment">
              <FileText size={24} />
              <div>
                <strong>Read the original PDF</strong>
                <span>Open, download, or print at your own pace.</span>
              </div>
              <a
                className="button secondary"
                href={pdfHref}
                target="_blank"
                rel="noreferrer"
              >
                Open PDF <ArrowUpRight size={15} />
              </a>
            </div>
          )}
          {note.pdfUrl && (
            <details className="pdf-preview">
              <summary>Preview PDF here</summary>
              <iframe
                src={pdfHref}
                title={`${note.title} PDF`}
                className="pdf-frame"
              />
            </details>
          )}
          {embed ? (
            <iframe
              className="video-frame"
              src={embed}
              title={note.title}
              allowFullScreen
            />
          ) : (
            note.videoUrl && (
              <a
                className="button secondary"
                href={note.videoUrl}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={16} />
                Open video
              </a>
            )
          )}
          <NoteMarkdown body={note.body} />
          <div className="reader-complete">
            <div>
              <Sparkles size={23} />
              <h3>One page closer.</h3>
              <p>Take a breath. You’ve made a little progress.</p>
            </div>
            <button
              className={`button ${data.completedNotes[id] ? "secondary" : "primary"}`}
              onClick={() => {
                update((d) => ({
                  ...d,
                  completedNotes: { ...d.completedNotes, [id]: Date.now() },
                }));
                notify("A little progress, saved.");
              }}
            >
              <Check size={16} />
              {data.completedNotes[id] ? "Read again today" : "Mark as read"}
            </button>
          </div>
        </article>
      </div>
      {related.length > 0 && (
        <section className="related">
          <h2>Keep the curiosity going.</h2>
          {related.map((n) => (
            <Link
              className="reading-row panel"
              key={n.id}
              href={`/notes/${n.id}`}
            >
              <BookOpen size={22} />
              <div>
                <span className="eyebrow">UP NEXT</span>
                <h3>{n.title}</h3>
              </div>
              <ArrowRight size={19} />
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
function NoteMarkdown({ body }: { body: string }) {
  let index = 0;
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => <h1 id={`section-${index++}`}>{children}</h1>,
          h2: ({ children }) => <h2 id={`section-${index++}`}>{children}</h2>,
          h3: ({ children }) => <h3 id={`section-${index++}`}>{children}</h3>,
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
function PracticeLibrary({
  data,
  mode,
  query,
}: ContentProps & { mode: "quiz" | "flashcards"; query: string }) {
  const [filters, setFilters] = useState<
    Partial<Academic> & { subject?: string }
  >({});
  const items =
    mode === "quiz"
      ? filterContent(data.quizzes, query, filters)
      : filterContent(data.decks, query, filters);
  return (
    <>
      <PageHeading
        eyebrow={
          mode === "quiz"
            ? "TURN KNOWING INTO UNDERSTANDING"
            : "LITTLE CARDS. LASTING IDEAS."
        }
        title={
          mode === "quiz"
            ? "Give your knowledge a little nudge."
            : "Make it stick, one flip at a time."
        }
        description={
          mode === "quiz"
            ? "A few questions to find what clicks—and what’s worth another look."
            : "A calmer way to remember the things that matter."
        }
        action={
          <Link
            className="button secondary"
            href={`/admin/${mode === "quiz" ? "quizzes" : "flashcards"}`}
          >
            <Plus size={16} />
            Create {mode === "quiz" ? "quiz" : "study set"}
          </Link>
        }
      />
      <div className="filter-fields panel practice-filters">
        <AcademicFields all value={filters} onChange={setFilters} />
        <label className="field">
          <span>Subject</span>
          <select
            value={filters.subject || "all"}
            onChange={(e) =>
              setFilters({ ...filters, subject: e.target.value })
            }
          >
            <option value="all">All subjects</option>
            {[
              ...new Set(
                (mode === "quiz" ? data.quizzes : data.decks).map(
                  (i) => i.subject,
                ),
              ),
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="practice-grid">
        {items.map((item, index) => (
          <article key={item.id} className="practice-card panel">
            <div
              className={`practice-illustration ${subjectColors[item.subject] || "lavender"}`}
            >
              <span className="practice-number">0{index + 1}</span>
              {mode === "quiz" ? (
                <CircleHelp size={60} strokeWidth={1} />
              ) : (
                <Layers3 size={60} strokeWidth={1} />
              )}
              <span className="art-spark">✦</span>
            </div>
            <div className="practice-card-body">
              <span className="eyebrow">{item.subject}</span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <div className="note-meta">
                <span>
                  {"questions" in item
                    ? `${item.questions.length} questions`
                    : `${item.cards.length} cards`}
                </span>
                <span>
                  {"minutes" in item ? (
                    <>
                      <Clock3 size={13} />
                      {item.minutes} min
                    </>
                  ) : (
                    "At your own pace"
                  )}
                </span>
              </div>
              {mode === "quiz" &&
                data.attempts.filter(
                  (a) => a.quizId === item.id && a.completedAt !== null,
                ).length > 0 && (
                  <p className="small progress-hint">
                    <Check size={14} />
                    {
                      data.attempts.filter(
                        (a) => a.quizId === item.id && a.completedAt !== null,
                      ).length
                    }{" "}
                    completed attempts
                  </p>
                )}
              {mode === "flashcards" && data.reviews[item.id]?.finishedAt && (
                <p className="small progress-hint">
                  <Check size={14} />
                  Set reviewed
                </p>
              )}
              <Link
                className="button full secondary"
                href={`/${mode}/${item.id}`}
              >
                {mode === "quiz"
                  ? data.attempts.some(
                      (a) => a.quizId === item.id && a.completedAt === null,
                    )
                    ? "Resume practice"
                    : "Let’s practice"
                  : data.reviews[item.id] && !data.reviews[item.id].finishedAt
                    ? "Keep reviewing"
                    : "Start flipping"}
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!items.length && (
        <Empty title="Your next challenge belongs here.">
          <p>
            Try another filter, or make a new{" "}
            {mode === "quiz" ? "quiz" : "flashcard set"} in Content studio.
          </p>
        </Empty>
      )}
    </>
  );
}
function QuizRunner({
  data,
  update,
  notify,
  id,
}: ContentProps & { id: string }) {
  const quiz = data.quizzes.find((q) => q.id === id && q.published);
  const [attemptId, setAttemptId] = useState<string | null>(
    () =>
      data.attempts.find((a) => a.quizId === id && a.completedAt === null)
        ?.id || null,
  );
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const attempt = data.attempts.find((a) => a.id === attemptId);
  useEffect(() => {
    if (!attempt || attempt.completedAt !== null) return;
    const tick = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(tick);
  }, [attempt]);
  useEffect(() => {
    if (attempt && attempt.completedAt === null && now >= attempt.deadline) {
      update((d) => ({
        ...d,
        attempts: d.attempts.map((a) =>
          a.id === attempt.id ? finishAttempt(a) : a,
        ),
      }));
    }
  }, [now, attempt, update]);
  if (!quiz)
    return (
      <Empty title="This quiz isn’t available.">
        <Link href="/quiz">Back to practice →</Link>
      </Empty>
    );
  const begin = () => {
    const next = startAttempt(quiz);
    update((d) => ({ ...d, attempts: [next, ...d.attempts] }));
    setAttemptId(next.id);
    setIndex(0);
    setNow(Date.now());
  };
  const previous = data.attempts.filter(
    (a) => a.quizId === id && a.completedAt !== null,
  );
  const finish = () => {
    if (!attempt) return;
    update((d) => ({
      ...d,
      attempts: d.attempts.map((a) =>
        a.id === attempt.id ? finishAttempt(a) : a,
      ),
    }));
    notify("Practice complete. Every attempt is a step forward.");
  };
  return (
    <>
      <Link className="back-link" href="/quiz">
        <ArrowLeft size={16} />
        Back to practice quizzes
      </Link>
      {!attempt ? (
        <>
          <div className="practice-intro panel">
            <span className="empty-icon lavender">
              <CircleHelp size={34} />
            </span>
            <span className="eyebrow">{quiz.subject}</span>
            <h1>{quiz.title}</h1>
            <p>{quiz.description}</p>
            <div className="intro-facts">
              <span>
                <CircleHelp size={18} />
                {quiz.questions.length} questions
              </span>
              <span>
                <Clock3 size={18} />
                {quiz.minutes} minutes
              </span>
              <span>
                <RotateCcw size={18} />
                Unlimited attempts
              </span>
            </div>
            <p className="muted small">
              Questions and options shuffle each time. Your progress saves as
              you go.
            </p>
            <button className="button primary" onClick={begin}>
              I’m ready to try <ArrowRight size={17} />
            </button>
          </div>
          {previous.length > 0 && (
            <section className="panel previous-attempts">
              <h2>Your previous practice</h2>
              {previous.map((a) => (
                <button
                  className="history-row"
                  key={a.id}
                  onClick={() => {
                    setAttemptId(a.id);
                  }}
                >
                  <span>{new Date(a.completedAt!).toLocaleDateString()}</span>
                  <strong>
                    {a.score} / {a.questions.length}
                  </strong>
                  <span>
                    Review answers <ArrowRight size={15} />
                  </span>
                </button>
              ))}
            </section>
          )}
        </>
      ) : attempt.completedAt !== null ? (
        <QuizResults attempt={attempt} restart={begin} />
      ) : (
        <>
          <div className="quiz-heading">
            <div>
              <span className="eyebrow">{quiz.subject}</span>
              <h1>{quiz.title}</h1>
            </div>
            <span
              className={`timer ${attempt.deadline - now < 60000 ? "urgent" : ""}`}
            >
              <Clock3 size={18} />
              {Math.floor(Math.max(0, attempt.deadline - now) / 60000)}:
              {String(
                Math.floor(
                  (Math.max(0, attempt.deadline - now) % 60000) / 1000,
                ),
              ).padStart(2, "0")}
            </span>
          </div>
          <div className="quiz-layout">
            <section className="question-panel panel">
              <div className="question-meta">
                <span className="eyebrow">
                  QUESTION {index + 1} OF {attempt.questions.length}
                </span>
                <span className="muted small">One idea at a time.</span>
              </div>
              <div className="goal-progress">
                <span
                  style={{
                    width: `${((index + 1) / attempt.questions.length) * 100}%`,
                  }}
                />
              </div>
              <h2>{attempt.questions[index].prompt}</h2>
              <div className="answer-options">
                {attempt.questions[index].options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    className={`answer-option ${attempt.answers[attempt.questions[index].id] === optionIndex ? "chosen" : ""}`}
                    onClick={() =>
                      update((d) => ({
                        ...d,
                        attempts: d.attempts.map((a) =>
                          a.id === attempt.id
                            ? answerAttempt(
                                a,
                                attempt.questions[index].id,
                                optionIndex,
                              )
                            : a,
                        ),
                      }))
                    }
                  >
                    <span>{String.fromCharCode(65 + optionIndex)}</span>
                    {option}
                    {attempt.answers[attempt.questions[index].id] ===
                      optionIndex && <Check size={18} />}
                  </button>
                ))}
              </div>
              <div className="question-controls">
                <button
                  className="button secondary"
                  disabled={index === 0}
                  onClick={() => setIndex(index - 1)}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                {index < attempt.questions.length - 1 ? (
                  <button
                    className="button primary"
                    onClick={() => setIndex(index + 1)}
                  >
                    Next question <ChevronRight size={16} />
                  </button>
                ) : (
                  <button className="button primary" onClick={finish}>
                    Finish practice <Check size={16} />
                  </button>
                )}
              </div>
            </section>
            <aside className="question-map panel">
              <h3>Your questions</h3>
              <p className="muted small">Jump back whenever you need.</p>
              <div className="question-dots">
                {attempt.questions.map((q, i) => (
                  <button
                    key={q.id}
                    aria-label={`Go to question ${i + 1}`}
                    className={`${i === index ? "current" : ""} ${attempt.answers[q.id] !== undefined ? "answered" : ""}`}
                    onClick={() => setIndex(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <span className="muted small">
                {Object.keys(attempt.answers).length} of{" "}
                {attempt.questions.length} answered
              </span>
              <button className="button secondary full" onClick={finish}>
                Finish & review <ArrowRight size={15} />
              </button>
            </aside>
          </div>
        </>
      )}
    </>
  );
}
function QuizResults({
  attempt,
  restart,
}: {
  attempt: Attempt;
  restart: () => void;
}) {
  return (
    <>
      <section className="results-hero panel">
        <span className="result-star">✳</span>
        <p className="eyebrow">A LITTLE WISER THAN BEFORE</p>
        <h1>That’s progress, pal.</h1>
        <p>Every question is a chance to understand a little more.</p>
        <div className="score-display">
          {attempt.score}
          <span>/ {attempt.questions.length}</span>
        </div>
        <div className="intro-facts">
          <span>
            {Math.round((attempt.score / attempt.questions.length) * 100)}%
            accuracy
          </span>
          <span>
            {Math.ceil(
              ((attempt.completedAt || attempt.deadline) - attempt.startedAt) /
                1000,
            )}{" "}
            seconds
          </span>
          <span>
            {attempt.questions.length - Object.keys(attempt.answers).length}{" "}
            unanswered
          </span>
        </div>
        <button className="button primary" onClick={restart}>
          <RotateCcw size={16} />
          Give it another go
        </button>
      </section>
      <section className="answer-review">
        <div className="section-heading">
          <h2>Let’s make it click.</h2>
          <span className="muted">Your answer breakdown</span>
        </div>
        {attempt.questions.map((q, index) => (
          <article key={q.id} className="panel review-question">
            <div className="question-meta">
              <span className="eyebrow">QUESTION {index + 1}</span>
              <span
                className={`subject-pill ${attempt.answers[q.id] === q.correct ? "mint" : "peach"}`}
              >
                {attempt.answers[q.id] === q.correct
                  ? "Got it"
                  : "Worth another look"}
              </span>
            </div>
            <h3>{q.prompt}</h3>
            <p>
              <strong>Your answer:</strong>{" "}
              {q.options[attempt.answers[q.id]] || "Not answered"}
            </p>
            <p>
              <strong>Correct answer:</strong> {q.options[q.correct]}
            </p>
            <div className="explanation">
              <Sparkles size={17} />
              <p>{q.explanation}</p>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
function FlashcardRunner({ data, update, id }: ContentProps & { id: string }) {
  const deck = data.decks.find((d) => d.id === id && d.published);
  const [flipped, setFlipped] = useState(false);
  const review = data.reviews[id] || {
    index: 0,
    known: [],
    reviewed: [],
    finishedAt: null,
  };
  if (!deck)
    return (
      <Empty title="This study set isn’t available.">
        <Link href="/flashcards">Back to flashcards →</Link>
      </Empty>
    );
  const index = Math.min(review.index, deck.cards.length - 1);
  const card = deck.cards[index];
  const next = (known: boolean) => {
    const reviewed = [...new Set([...review.reviewed, card.id])];
    const knownCards = known
      ? [...new Set([...review.known, card.id])]
      : review.known.filter((c) => c !== card.id);
    update((d) => ({
      ...d,
      reviews: {
        ...d.reviews,
        [id]: {
          index: Math.min(index + 1, deck.cards.length - 1),
          known: knownCards,
          reviewed,
          finishedAt: index === deck.cards.length - 1 ? Date.now() : null,
        },
      },
    }));
    setFlipped(false);
  };
  const reset = () => {
    update((d) => ({
      ...d,
      reviews: {
        ...d.reviews,
        [id]: { index: 0, known: [], reviewed: [], finishedAt: null },
      },
    }));
    setFlipped(false);
  };
  return (
    <>
      <Link className="back-link" href="/flashcards">
        <ArrowLeft size={16} />
        Back to flashcards
      </Link>
      <PageHeading
        eyebrow={deck.subject}
        title={deck.title}
        description={deck.description}
      />
      {review.finishedAt ? (
        <div className="practice-intro panel">
          <span className="result-star">✳</span>
          <h1>A few more ideas, tucked away.</h1>
          <p>
            You reviewed {deck.cards.length} cards and knew{" "}
            {review.known.length} of them.
          </p>
          <div className="intro-facts">
            <span>
              <Check size={19} />
              {review.known.length} feeling confident
            </span>
            <span>
              <RotateCcw size={19} />
              {deck.cards.length - review.known.length} worth revisiting
            </span>
          </div>
          <button className="button primary" onClick={reset}>
            <RotateCcw size={16} />
            Review this set again
          </button>
          <Link className="text-link" href="/flashcards">
            Find another set <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="flashcard-session">
          <div className="flashcard-progress">
            <span>
              Card {index + 1} of {deck.cards.length}
            </span>
            <span>
              {review.known.length} looking familiar <Sparkles size={14} />
            </span>
          </div>
          <div className="goal-progress">
            <span style={{ width: `${(index / deck.cards.length) * 100}%` }} />
          </div>
          <button
            className={`flashcard ${flipped ? "is-flipped" : ""}`}
            aria-label={
              flipped
                ? "Answer. Click to see question"
                : "Question. Click to reveal answer"
            }
            onClick={() => setFlipped(!flipped)}
          >
            <span className="eyebrow">
              {flipped
                ? "THE LITTLE LIGHTBULB MOMENT"
                : "GIVE IT A LITTLE THOUGHT"}
            </span>
            <span className="flashcard-text">
              {flipped ? card.back : card.front}
            </span>
            <span className="flip-hint">
              <RotateCcw size={15} />
              {flipped
                ? "Click to see the question"
                : "Click or press Enter to reveal"}
            </span>
          </button>
          <div className="flashcard-actions">
            {flipped ? (
              <>
                <button
                  className="button secondary"
                  onClick={() => next(false)}
                >
                  <RotateCcw size={16} />
                  Still learning
                </button>
                <button className="button primary" onClick={() => next(true)}>
                  <Check size={16} />I knew this one
                </button>
              </>
            ) : (
              <button
                className="button primary"
                onClick={() => setFlipped(true)}
              >
                Let’s see the answer <ArrowRight size={16} />
              </button>
            )}
          </div>
          <div className="flashcard-bottom">
            <button
              className="text-link"
              disabled={index === 0}
              onClick={() => {
                update((d) => ({
                  ...d,
                  reviews: {
                    ...d.reviews,
                    [id]: { ...review, index: Math.max(0, index - 1) },
                  },
                }));
                setFlipped(false);
              }}
            >
              <ChevronLeft size={15} />
              Previous card
            </button>
            <button className="text-link" onClick={reset}>
              Start over <RotateCcw size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
function AICompanion({ data, update, notify }: ContentProps) {
  const [chatId, setChatId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState("");
  const [input, setInput] = useState("");
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [subject, setSubject] = useState("Computer Networks");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [busy, setBusy] = useState(false);
  const [partial, setPartial] = useState("");
  const [error, setError] = useState("");
  const abort = useRef<AbortController | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const chat = data.chats.find((c) => c.id === chatId);
  const messages = chat?.messages || [];
  useEffect(() => {
    try {
      setKey(sessionStorage.getItem("notes-pal-gemini-key") || "");
    } catch {}
    return () => abort.current?.abort();
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length, partial]);
  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const currentSubject = chat?.subject || subject;
    const currentModel = chat?.model || model;
    const current: Chat = chat || {
      id: newId(),
      name: text.trim().slice(0, 55),
      subject: currentSubject,
      model: currentModel,
      messages: [],
    };
    const userMessage = { role: "user" as const, content: text.trim() };
    const history = [...current.messages, userMessage].slice(-100);
    setChatId(current.id);
    setInput("");
    setError("");
    setPartial("");
    update((d) => ({
      ...d,
      chats: chat
        ? d.chats.map((c) =>
            c.id === current.id ? { ...c, messages: history } : c,
          )
        : [{ ...current, messages: history }, ...d.chats],
    }));
    const relevant = data.notes.filter(
      (n) => n.published && n.subject === currentSubject,
    );
    if (!key) {
      const terms = text.toLowerCase().match(/[a-z]{3,}/g) || [];
      const scored = relevant
        .map((note) => ({
          note,
          score: terms.reduce(
            (sum, t) => sum + (note.body.toLowerCase().includes(t) ? 1 : 0),
            0,
          ),
        }))
        .sort((a, b) => b.score - a.score);
      const best = scored[0]?.note;
      const content = best
        ? `### From your notes: ${best.title}\n\n${best.body.slice(0, 7500)}\n\n---\n[Open this note](/notes/${best.id})\n\n*This is a passage from your library. Add a Gemini key for a conversational explanation.*`
        : "There aren’t any published notes for this subject yet. Add a note in Content studio, or connect Gemini for an AI explanation.";
      update((d) => ({
        ...d,
        chats: d.chats.map((c) =>
          c.id === current.id
            ? {
                ...c,
                messages: [...c.messages, { role: "assistant", content }],
              }
            : c,
        ),
      }));
      return;
    }
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    let output = "";
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          apiKey: key,
          model: currentModel,
          subject: currentSubject,
          context: relevant
            .map((n) => `# ${n.title}\n${n.body}`)
            .join("\n\n")
            .slice(0, 30000),
          messages: history.slice(-20),
        }),
      });
      if (!response.ok) {
        const problem = await response.json();
        throw new Error(problem.error || "Could not reach the AI companion.");
      }
      if (!response.body) throw new Error("The AI response was empty.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";
        for (const event of events) {
          const raw = event
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");
          if (!raw || raw === "[DONE]") continue;
          const payload = JSON.parse(raw);
          if (payload.error)
            throw new Error(
              "The AI service interrupted the response. Please try again.",
            );
          const piece =
            payload.candidates?.[0]?.content?.parts
              ?.filter((part: { thought?: boolean }) => !part.thought)
              .map((part: { text?: string }) => part.text || "")
              .join("") || "";
          output += piece;
          setPartial(output);
        }
        if (done) break;
      }
      if (!output.trim())
        throw new Error(
          "The model returned no answer. Try a different question or model.",
        );
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError"))
        setError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      if (output)
        update((d) => ({
          ...d,
          chats: d.chats.map((c) =>
            c.id === current.id
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { role: "assistant", content: output },
                  ],
                }
              : c,
          ),
        }));
      setPartial("");
      setBusy(false);
      abort.current = null;
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE HELP GOES A LONG WAY"
        title="Curiosity has good company."
        description="Explore your notes, untangle a concept, or ask that question on your mind."
        action={
          <button
            className="button secondary"
            onClick={() => setShowKey(!showKey)}
          >
            <Settings2 size={16} />
            {key ? "Gemini connected" : "Connect Gemini"}
          </button>
        }
      />
      {showKey && (
        <section className="panel ai-settings">
          <div>
            <h3>Your key, your choice.</h3>
            <p className="muted small">
              Without a key, your companion finds passages in your notes. With
              Gemini, it explains and answers using your published notes as
              context. Your key stays in this tab’s session storage and is sent
              only when you ask Gemini.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              try {
                if (key.trim())
                  sessionStorage.setItem("notes-pal-gemini-key", key.trim());
                else sessionStorage.removeItem("notes-pal-gemini-key");
                setKey(key.trim());
                setShowKey(false);
                notify(
                  key.trim()
                    ? "Gemini key saved for this tab."
                    : "Gemini disconnected.",
                );
              } catch {
                notify(
                  "Session storage is unavailable. The key works until you leave this page.",
                );
              }
            }}
          >
            <label className="field">
              <span>Gemini API key</span>
              <input
                type="password"
                autoComplete="off"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Paste your Gemini API key"
              />
            </label>
            <label className="field">
              <span>Model for new chats</span>
              <input
                required
                pattern="[a-zA-Z0-9.\-]+"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </label>
            <button className="button primary" type="submit">
              Save connection
            </button>
          </form>
        </section>
      )}
      {renameId && (
        <form
          className="panel rename-chat"
          onSubmit={(event) => {
            event.preventDefault();
            if (!renameText.trim()) return;
            update((previous) => ({
              ...previous,
              chats: previous.chats.map((item) =>
                item.id === renameId
                  ? { ...item, name: renameText.trim() }
                  : item,
              ),
            }));
            setRenameId(null);
          }}
        >
          <label className="field">
            <span>Conversation name</span>
            <input
              autoFocus
              required
              maxLength={200}
              value={renameText}
              onChange={(event) => setRenameText(event.target.value)}
            />
          </label>
          <button className="button primary" type="submit">
            Save name
          </button>
          <button
            className="button secondary"
            type="button"
            onClick={() => setRenameId(null)}
          >
            Cancel
          </button>
        </form>
      )}
      <div className="chat-layout">
        <aside className="chat-history panel">
          <button
            disabled={busy}
            className="button secondary full"
            onClick={() => {
              setChatId(null);
              setError("");
            }}
          >
            <Plus size={16} />A fresh conversation
          </button>
          <span className="eyebrow">YOUR CONVERSATIONS</span>
          {data.chats.length === 0 && (
            <p className="muted small">A good question starts something.</p>
          )}
          {data.chats.map((c) => (
            <div
              className={`chat-history-row ${c.id === chatId ? "selected" : ""}`}
              key={c.id}
            >
              <button
                disabled={busy}
                onClick={() => {
                  setChatId(c.id);
                  setSubject(c.subject);
                  setError("");
                }}
              >
                <strong>{c.name}</strong>
                <span>{c.subject}</span>
              </button>
              <button
                disabled={busy}
                className="icon-button"
                aria-label={`Rename chat ${c.name}`}
                onClick={() => {
                  setRenameId(c.id);
                  setRenameText(c.name);
                }}
              >
                <Pencil size={13} />
              </button>
              <button
                disabled={busy}
                className="icon-button"
                aria-label={`Delete chat ${c.name}`}
                onClick={() => {
                  update((d) => ({
                    ...d,
                    chats: d.chats.filter((item) => item.id !== c.id),
                  }));
                  if (chatId === c.id) setChatId(null);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </aside>
        <section className="chat-panel panel">
          <div className="chat-top">
            <span className="icon-tile yellow">
              <Sparkles size={20} />
            </span>
            <div>
              <h3>
                {key ? "Your AI study companion" : "Your notes companion"}
              </h3>
              <span className="muted small">
                {key ? chat?.model || model : "Grounded in your own library"}
              </span>
            </div>
            <label className="sr-only" htmlFor="chat-subject">
              Subject
            </label>
            <select
              id="chat-subject"
              disabled={!!chat || busy}
              value={chat?.subject || subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              {[...new Set([...data.notes.map((n) => n.subject), subject])].map(
                (s) => (
                  <option key={s}>{s}</option>
                ),
              )}
            </select>
          </div>
          <div className="chat-messages" aria-live="polite">
            {!messages.length ? (
              <div className="chat-welcome">
                <span className="companion-flower">✳</span>
                <h2>Let’s make it make sense.</h2>
                <p>
                  A tricky topic? A quick recap?
                  <br />
                  We’ll take it one idea at a time.
                </p>
                <div className="suggestions">
                  {[
                    "Explain the key concepts",
                    "Help me revise for my exam",
                    "Show me a practical example",
                  ].map((prompt) => (
                    <button key={prompt} onClick={() => send(prompt)}>
                      {prompt}
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <article key={index} className={`chat-message ${message.role}`}>
                  <span className="message-avatar">
                    {message.role === "user" ? (
                      data.profile.name[0]
                    ) : (
                      <Sparkles size={15} />
                    )}
                  </span>
                  <div>
                    <span className="eyebrow">
                      {message.role === "user"
                        ? "YOU"
                        : key
                          ? "YOUR COMPANION"
                          : "FROM YOUR LIBRARY"}
                    </span>
                    <Markdown>{message.content}</Markdown>
                  </div>
                </article>
              ))
            )}
            {busy && (
              <article className="chat-message assistant">
                <span className="message-avatar">
                  <Sparkles size={15} />
                </span>
                <div>
                  {partial ? (
                    <Markdown>{partial}</Markdown>
                  ) : (
                    <p className="muted">Connecting a few ideas…</p>
                  )}
                </div>
              </article>
            )}
            <div ref={bottom} />
          </div>
          {error && (
            <p className="inline-error" role="alert">
              {error}
            </p>
          )}
          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <textarea
              aria-label="Message your study companion"
              maxLength={4000}
              rows={2}
              placeholder="What are you curious about?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
            />
            {busy ? (
              <button
                type="button"
                className="button secondary"
                onClick={() => abort.current?.abort()}
              >
                Stop
              </button>
            ) : (
              <button
                disabled={!input.trim()}
                className="button primary"
                type="submit"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            )}
          </form>
          <p className="chat-disclaimer">
            {key
              ? "AI can make mistakes. Check important details against your course materials."
              : "Library mode · Add a Gemini key for conversational AI."}
          </p>
        </section>
      </div>
    </>
  );
}
function downloadFile(name: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Preferences({
  data,
  update,
  notify,
  recover,
}: ContentProps & { recover: () => void }) {
  const [profile, setProfile] = useState(data.profile);
  const [restore, setRestore] = useState<WorkspaceData | null>(null);
  const [error, setError] = useState("");
  const [reset, setReset] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="MAKE YOURSELF AT HOME"
        title="Your space. Your pace."
        description="A few small preferences to make learning feel more like you."
      />
      <div className="preferences-grid">
        <section className="panel settings-panel">
          <div className="settings-heading">
            <GraduationCap size={23} />
            <div>
              <h2>A little about you</h2>
              <p>No account needed. These details stay in your browser.</p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!profile.name.trim()) return;
              update((d) => ({
                ...d,
                profile: { ...profile, name: profile.name.trim() },
              }));
              notify("Your space feels a little more like you.");
            }}
          >
            <label className="field">
              <span>What should we call you?</span>
              <input
                required
                maxLength={80}
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <AcademicFields
                value={profile}
                onChange={(next) => setProfile({ ...profile, ...next })}
              />
            </div>
            <label className="field">
              <span>Daily study activities</span>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={profile.goal}
                onChange={(e) =>
                  setProfile({ ...profile, goal: Number(e.target.value) })
                }
              />
              <small>
                Reading a note, finishing a quiz, or reviewing a flashcard set
                counts.
              </small>
            </label>
            <button className="button primary" type="submit">
              Save preferences <Check size={16} />
            </button>
          </form>
        </section>
        <div>
          <section className="panel settings-panel">
            <div className="settings-heading">
              <ArrowDownToLine size={23} />
              <div>
                <h2>A little peace of mind</h2>
                <p>Keep a copy of your learning journey.</p>
              </div>
            </div>
            <p className="muted small">
              Notes, quizzes, flashcards, chats, feedback, and progress live in
              this browser. They don’t sync across devices. Export a backup
              before clearing browser data. Gemini keys are excluded.
            </p>
            <button
              className="button secondary full"
              onClick={() =>
                downloadFile(
                  `notes-pal-backup-${new Date().toISOString().slice(0, 10)}.json`,
                  JSON.stringify(data, null, 2),
                )
              }
            >
              <ArrowDownToLine size={17} />
              Export workspace backup
            </button>
            <label className="button secondary full file-button">
              <Upload size={17} />
              Restore a workspace backup
              <input
                type="file"
                accept="application/json,.json"
                aria-label="Restore workspace backup"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    if (file.size > 8_000_000)
                      throw new Error("Backup must be smaller than 8 MB.");
                    setRestore(parseBackup(await file.text()));
                    setError("");
                  } catch {
                    setError(
                      "This file isn’t a valid Notes Pal workspace backup. Your current data is unchanged.",
                    );
                  }
                  e.target.value = "";
                }}
              />
            </label>
            {error && (
              <p className="inline-error" role="alert">
                {error}
              </p>
            )}
            {restore && (
              <div className="confirmation">
                <h3>Replace your workspace?</h3>
                <p>
                  This backup contains {restore.notes.length} notes,{" "}
                  {restore.quizzes.length} quizzes, and {restore.decks.length}{" "}
                  flashcard sets. Export your current workspace first if you
                  want to keep it.
                </p>
                <button
                  className="button primary"
                  onClick={() => {
                    update(() => restore);
                    setProfile(restore.profile);
                    recover();
                    setRestore(null);
                    notify("Your workspace is restored.");
                  }}
                >
                  Restore this backup
                </button>
                <button className="text-link" onClick={() => setRestore(null)}>
                  Cancel
                </button>
              </div>
            )}
          </section>
          <section className="panel settings-panel">
            <h3>Need a fresh page?</h3>
            <p className="muted small">
              You can download the raw saved file for recovery, or start a new
              workspace.
            </p>
            <button
              className="text-link"
              onClick={() => {
                try {
                  downloadFile(
                    "notes-pal-recovery.json",
                    localStorage.getItem(storageKey) || "{}",
                  );
                } catch {
                  notify("Browser storage is unavailable.");
                }
              }}
            >
              Download saved data <ArrowDownToLine size={14} />
            </button>
            <button className="text-link danger" onClick={() => setReset(true)}>
              Start fresh <RotateCcw size={14} />
            </button>
            {reset && (
              <div className="confirmation">
                <p>
                  This replaces all content and history with the starter
                  library. Export a backup first.
                </p>
                <button
                  className="button danger-button"
                  onClick={() => {
                    const fresh = createWorkspace();
                    update(() => fresh);
                    setProfile(fresh.profile);
                    recover();
                    setReset(false);
                    notify("A fresh page, ready for you.");
                  }}
                >
                  Replace my workspace
                </button>
                <button className="text-link" onClick={() => setReset(false)}>
                  Keep my workspace
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
function History({ data }: ContentProps) {
  const complete = data.attempts.filter((a) => a.completedAt !== null);
  const reviewed = Object.entries(data.reviews).filter(([, r]) => r.finishedAt);
  const events = [
    ...Object.entries(data.completedNotes).map(([id, time]) => ({
      id: `note-${id}`,
      title: data.notes.find((n) => n.id === id)?.title || "An archived note",
      kind: "Note read",
      time,
      href: `/notes/${id}`,
      icon: BookOpen,
    })),
    ...complete.map((a) => ({
      id: a.id,
      title: a.title,
      kind: `Quiz · ${a.score}/${a.questions.length} correct`,
      time: a.completedAt!,
      href: `/quiz/${a.quizId}`,
      icon: CircleHelp,
    })),
    ...reviewed.map(([id, r]) => ({
      id: `deck-${id}`,
      title:
        data.decks.find((d) => d.id === id)?.title || "An archived study set",
      kind: `Flashcards · ${r.known.length} known`,
      time: r.finishedAt!,
      href: `/flashcards/${id}`,
      icon: Layers3,
    })),
  ].sort((a, b) => b.time - a.time);
  return (
    <>
      <PageHeading
        eyebrow="LOOK HOW FAR YOU’VE COME"
        title="Every little step adds up."
        description="Your learning journey, one good moment at a time."
      />
      <div className="stats-row">
        <Stat
          icon={BookOpen}
          color="peach"
          label="Notes read"
          value={Object.keys(data.completedNotes).length}
          detail="A growing collection of ideas"
        />
        <Stat
          icon={CircleHelp}
          color="lavender"
          label="Quizzes completed"
          value={complete.length}
          detail={
            complete.length
              ? `${Math.round((complete.reduce((s, a) => s + a.score / a.questions.length, 0) / complete.length) * 100)}% average accuracy`
              : "Your first try is waiting"
          }
        />
        <Stat
          icon={Layers3}
          color="mint"
          label="Sets reviewed"
          value={reviewed.length}
          detail="Making the knowledge stick"
        />
      </div>
      <section className="panel activity-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">YOUR RECENT RHYTHM</p>
            <h2>A little consistency.</h2>
          </div>
          <span className="muted small">The last 28 days</span>
        </div>
        <div className="activity-days">
          {Array.from({ length: 28 }, (_, i) => {
            const day = new Date();
            day.setDate(day.getDate() - (27 - i));
            const count = events.filter(
              (e) => new Date(e.time).toDateString() === day.toDateString(),
            ).length;
            return (
              <div
                key={i}
                title={`${day.toLocaleDateString()}: ${count} activities`}
                className={`activity-day ${count > 0 ? "has-activity" : ""}`}
              >
                <span>
                  {day.toLocaleDateString(undefined, { weekday: "narrow" })}
                </span>
                <div
                  style={
                    count
                      ? { opacity: Math.min(1, 0.4 + count * 0.2) }
                      : undefined
                  }
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section className="panel activity-panel">
        <h2>Moments of progress</h2>
        {events.length ? (
          events.map((event) => (
            <Link className="reading-row" key={event.id} href={event.href}>
              <span className="reading-icon mint">
                <event.icon size={20} />
              </span>
              <div>
                <span className="eyebrow">{event.kind}</span>
                <h3>{event.title}</h3>
                <span className="muted small">
                  {new Date(event.time).toLocaleString()}
                </span>
              </div>
              <ArrowUpRight size={18} />
            </Link>
          ))
        ) : (
          <Empty title="Your story starts with a step.">
            <Link className="button secondary" href="/notes">
              Find something to read <ArrowRight size={15} />
            </Link>
          </Empty>
        )}
      </section>
    </>
  );
}
function InfoPage({
  section,
  onReport,
}: {
  section: string;
  onReport: () => void;
}) {
  return (
    <>
      <PageHeading
        eyebrow="A SPACE FOR CURIOUS MINDS"
        title={
          section === "privacy"
            ? "Your learning stays yours."
            : section === "terms"
              ? "A few shared understandings."
              : "A little more about Notes Pal."
        }
        description="An open study workspace, built around the way you learn."
      />
      <section className="panel info-page">
        <h2>Everything you need to find your flow.</h2>
        <p>
          Notes Pal brings engineering notes, practice quizzes, flashcards, and
          a study companion into one calm space. Every resource is free, with no
          login or purchase required.
        </p>
        <h3>A personal workspace</h3>
        <p>
          Your content edits, academic preferences, chat history, and learning
          progress are saved in your browser. Content studio edits only your own
          workspace; it is not a shared administration system. Export a backup
          to move your data to another browser or share a custom library.
        </p>
        <h3>Your privacy</h3>
        <p>
          There are no analytics trackers, accounts, payment services, or hosted
          CMS connections. When you connect Gemini, your question, recent
          conversation, and relevant published notes are sent through the app to
          Google’s Gemini service using your key. External videos and PDFs
          contact their respective hosts when opened.
        </p>
        <h3>Study thoughtfully</h3>
        <p>
          Starter materials and AI answers can contain mistakes. Verify
          important details against your syllabus and official course materials.
          Only add content you have permission to use.
        </p>
        <h3>Have an idea?</h3>
        <p>
          Keep feedback in your workspace, then export it from Content studio
          when you want to share it.
        </p>
        <button className="button secondary" onClick={onReport}>
          <Flag size={16} />
          Save some feedback
        </button>
      </section>
    </>
  );
}
