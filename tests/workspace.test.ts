import { test } from "node:test";
import assert from "node:assert/strict";
import {
  answerAttempt,
  createWorkspace,
  filterContent,
  finishAttempt,
  parseBackup,
  resourceUrl,
  startAttempt,
  videoEmbed,
  workspaceSchema,
} from "../src/lib/workspace";

test("starter library is valid, unlocked, and includes the existing bundled PDF", () => {
  const state = createWorkspace();
  assert.equal(state.notes.length, 11);
  assert.equal(state.quizzes.length, 3);
  assert.equal(state.decks.length, 3);
  assert.ok(state.notes.every((note) => note.published));
  assert.ok(state.notes.some((note) => /^\/materials\//.test(note.pdfUrl)));
  assert.equal(workspaceSchema.safeParse(state).success, true);
});
test("filters use consistent university values and never expose drafts in study views", () => {
  const state = createWorkspace();
  state.notes[0].published = false;
  assert.equal(
    filterContent(state.notes, "", { university: "ABES EC" }).length,
    0,
  );
  assert.equal(
    filterContent(state.notes, "requirements", {
      university: "AKTU",
      semester: "5",
    }).length,
    1,
  );
  assert.equal(filterContent(state.notes, "", {}).length, 10);
  assert.equal(filterContent(state.notes, "", {}, true).length, 11);
});
test("quiz randomization preserves correct answer identity", () => {
  const quiz = createWorkspace().quizzes[0];
  const answerByQuestion = new Map(
    quiz.questions.map((q) => [q.id, q.options[q.correct]]),
  );
  for (let i = 0; i < 12; i++) {
    const attempt = startAttempt(quiz, 1000);
    for (const q of attempt.questions)
      assert.equal(q.options[q.correct], answerByQuestion.get(q.id));
    assert.equal(
      new Set(attempt.questions.map((q) => q.id)).size,
      quiz.questions.length,
    );
  }
});
test("quiz rejects unrelated questions, invalid options, and answers past its deadline", () => {
  const attempt = startAttempt(createWorkspace().quizzes[0], 1000);
  const q = attempt.questions[0];
  assert.equal(answerAttempt(attempt, "unrelated", 0, 1001), attempt);
  assert.equal(answerAttempt(attempt, q.id, -1, 1001), attempt);
  assert.equal(answerAttempt(attempt, q.id, q.options.length, 1001), attempt);
  assert.equal(answerAttempt(attempt, q.id, 0, attempt.deadline), attempt);
  const answered = answerAttempt(attempt, q.id, q.correct, 1001);
  const complete = finishAttempt(answered, 2000);
  assert.equal(complete.score, 1);
  assert.equal(answerAttempt(complete, q.id, 0, 2001), complete);
  assert.equal(finishAttempt(complete, 3000), complete);
});
test("expired quiz completion caps time and a backup restores the original deadline", () => {
  const state = createWorkspace();
  const attempt = startAttempt(state.quizzes[0], 1000);
  state.attempts = [attempt];
  const restored = parseBackup(JSON.stringify(state));
  assert.equal(restored.attempts[0].deadline, attempt.deadline);
  assert.equal(
    finishAttempt(restored.attempts[0], attempt.deadline + 50000).completedAt,
    attempt.deadline,
  );
});
test("backup preserves study history, notes, feedback, and settings without a Gemini key", () => {
  const state = createWorkspace();
  state.profile.name = "Sam";
  state.theme = "dark";
  state.bookmarks = [state.notes[0].id];
  state.completedNotes[state.notes[0].id] = 1000;
  state.reports.push({
    id: "report-1",
    title: "Feedback",
    url: "/notes",
    body: "Add a diagram",
    createdAt: 1000,
    resolved: false,
  });
  assert.deepEqual(parseBackup(JSON.stringify(state)), state);
  assert.equal("apiKey" in state, false);
});
test("invalid, duplicate, oversized, and unsafe backup content is rejected", () => {
  const state = createWorkspace();
  assert.throws(() => parseBackup("not JSON"));
  assert.throws(() => parseBackup("{}"));
  assert.throws(() => parseBackup("x".repeat(8_000_001)));
  state.notes.push(state.notes[0]);
  assert.throws(() => parseBackup(JSON.stringify(state)));
  state.notes.pop();
  state.notes[0].pdfUrl = "javascript:alert(1)";
  assert.throws(() => parseBackup(JSON.stringify(state)));
  assert.equal(resourceUrl.safeParse("//example.com/file.pdf").success, false);
  assert.equal(
    resourceUrl.safeParse("https://example.com/file.pdf").success,
    true,
  );
});
test("embedded media only uses known YouTube hosts and valid video IDs", () => {
  assert.equal(
    videoEmbed("https://youtu.be/dQw4w9WgXcQ"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
  assert.equal(
    videoEmbed("https://youtube.com/watch?v=dQw4w9WgXcQ"),
    "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
  );
  assert.equal(
    videoEmbed("https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ"),
    null,
  );
  assert.equal(videoEmbed("javascript:alert(1)"), null);
});

test("PDF backups reject invalid base64 and preserve actual PDF attachments", () => {
  const state = createWorkspace();
  state.notes[0].pdfUrl = "data:application/pdf;base64,=";
  assert.throws(() => parseBackup(JSON.stringify(state)));
  state.notes[0].pdfUrl =
    "data:application/pdf;base64," + btoa("%PDF-1.4\nvalid-prefix");
  assert.equal(
    parseBackup(JSON.stringify(state)).notes[0].pdfUrl,
    state.notes[0].pdfUrl,
  );
});
