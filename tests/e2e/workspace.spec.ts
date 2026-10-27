import { test, expect, type Page } from "@playwright/test";

async function open(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
}
async function state(page: Page) {
  return page.evaluate(() =>
    JSON.parse(localStorage.getItem("notes-pal-workspace-v1") || "{}"),
  );
}

test("anonymous dashboard loads with no trackers, login, or horizontal overflow", async ({
  page,
}, info) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1")) external.push(r.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await expect(
    page.getByRole("heading", { name: "A little focus. A lot of progress." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /sign in|sign up|checkout/i }),
  ).toHaveCount(0);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `test-results/overview-${info.project.name}.png`,
    fullPage: true,
  });
});
test("library filters, bookmarks, PDF, and read progress survive reload", async ({
  page,
}) => {
  await open(page, "/notes");
  await page
    .getByRole("textbox", { name: "Search study notes" })
    .fill("Requirements");
  await expect(page.locator(".note-card")).toHaveCount(1);
  await page.getByRole("button", { name: /Save Unit 2/ }).click();
  await page.reload();
  expect((await state(page)).bookmarks.length).toBe(1);
  await open(page, "/notes/algorithms-unit-1-handwritten");
  await expect(page.getByRole("link", { name: "Open PDF" })).toHaveAttribute(
    "href",
    "/materials/algorithms-unit-1.pdf",
  );
  const pdf = await page.request.get("/materials/algorithms-unit-1.pdf");
  expect(pdf.ok()).toBe(true);
  await page.getByRole("button", { name: "Mark as read" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Read again today" }),
  ).toBeVisible();
});
test("quiz resumes with the same options and saves its final results", async ({
  page,
}) => {
  await open(page, "/quiz/network-foundations");
  await page.getByRole("button", { name: "I’m ready to try" }).click();
  await page.locator(".answer-option").first().click();
  const before = await state(page);
  await page.reload();
  await expect(page.locator(".answer-option.chosen")).toHaveCount(1);
  expect((await state(page)).attempts[0].deadline).toBe(
    before.attempts[0].deadline,
  );
  expect((await state(page)).attempts[0].questions).toEqual(
    before.attempts[0].questions,
  );
  for (let i = 1; i < 5; i++) {
    await page.getByRole("button", { name: "Next question" }).click();
    await page.locator(".answer-option").first().click();
  }
  await page
    .getByRole("button", { name: "Finish practice", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "That’s progress, pal." }),
  ).toBeVisible();
  const saved = await state(page);
  expect(saved.attempts[0].completedAt).not.toBeNull();
  expect(saved.attempts[0].score).toBeGreaterThanOrEqual(0);
});
test("an expired quiz automatically finishes after reload", async ({
  page,
}) => {
  await open(page, "/quiz/network-foundations");
  await page.getByRole("button", { name: "I’m ready to try" }).click();
  await page.evaluate(() => {
    const key = "notes-pal-workspace-v1";
    const saved = JSON.parse(localStorage.getItem(key)!);
    saved.attempts[0].deadline = Date.now() - 1000;
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "That’s progress, pal." }),
  ).toBeVisible();
  expect((await state(page)).attempts[0].completedAt).not.toBeNull();
});
test("flashcards reveal answers, resume, and record a completed set", async ({
  page,
}) => {
  await open(page, "/flashcards/automata");
  await page.getByRole("button", { name: "Let’s see the answer" }).click();
  await page.getByRole("button", { name: "I knew this one" }).click();
  await page.reload();
  await expect(page.getByText("Card 2 of 4")).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: "Let’s see the answer" }).click();
    await page
      .getByRole("button", { name: "Still learning", exact: true })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "A few more ideas, tucked away." }),
  ).toBeVisible();
  expect((await state(page)).reviews.automata.known.length).toBe(1);
});
test("content studio creates, edits, publishes and deletes a note", async ({
  page,
}) => {
  await open(page, "/admin");
  await page.getByRole("button", { name: "Create note" }).click();
  const editor = page.getByRole("dialog", { name: "Edit resource" });
  await editor
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("A newly clear idea");
  await editor
    .getByRole("textbox", { name: "Note content", exact: true })
    .fill("# Hello curiosity\n\nA useful explanation.");
  await editor.getByRole("button", { name: "Save note" }).click();
  await expect(editor).toHaveCount(0);
  await expect(
    page.getByText("A newly clear idea", { exact: true }),
  ).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: "A newly clear idea" });
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await editor
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("An even clearer idea");
  await editor.getByRole("button", { name: "Save note" }).click();
  await open(page, "/notes");
  await expect(
    page.getByRole("heading", { name: "An even clearer idea" }),
  ).toBeVisible();
  await open(page, "/admin");
  await page
    .getByRole("button", { name: "Delete An even clearer idea" })
    .click();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(
    page.getByText("An even clearer idea", { exact: true }),
  ).toHaveCount(0);
});
test("preferences, backup export, feedback, and dark theme work without an account", async ({
  page,
}) => {
  await open(page, "/profile");
  await page
    .getByRole("textbox", { name: "What should we call you?" })
    .fill("Sam");
  await page.getByRole("button", { name: "Save preferences" }).click();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "What should we call you?" }),
  ).toHaveValue("Sam");
  await page.getByRole("button", { name: "Switch color theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export workspace backup" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/notes-pal-backup/);
  await page.getByRole("button", { name: "Share feedback" }).click();
  await page
    .getByRole("textbox", { name: "Your feedback" })
    .fill("Add another network diagram.");
  await page.getByRole("button", { name: "Save feedback" }).click();
  await open(page, "/admin/reports");
  await expect(page.getByText("Add another network diagram.")).toBeVisible();
  await page.getByRole("button", { name: "Resolve", exact: true }).click();
  expect((await state(page)).reports[0].resolved).toBe(true);
});
test("notes companion works without a key and saves its conversation", async ({
  page,
}) => {
  await open(page, "/ai");
  await page.getByRole("button", { name: "Explain the key concepts" }).click();
  await expect(page.locator(".chat-message.assistant")).toContainText(
    "From your notes",
  );
  expect((await state(page)).chats[0].messages.length).toBe(2);
  await page.reload();
  await expect(page.locator(".chat-history-row")).toHaveCount(1);
});
test("invalid backup cannot overwrite existing data", async ({ page }) => {
  await open(page, "/profile");
  const before = await state(page);
  await page.getByLabel("Restore workspace backup").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1}'),
  });
  await expect(page.locator(".inline-error[role=alert]")).toContainText(
    "isn’t a valid Notes Pal",
  );
  expect(await state(page)).toEqual(before);
});
test("corrupt saved data remains recoverable instead of being overwritten", async ({
  page,
}) => {
  await open(page);
  await page.evaluate(() =>
    localStorage.setItem("notes-pal-workspace-v1", "{broken"),
  );
  await page.reload();
  await expect(page.locator(".storage-warning[role=alert]")).toContainText(
    "could not be loaded",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("notes-pal-workspace-v1")),
  ).toBe("{broken");
});

test("studio-created quizzes and flashcards can be studied", async ({
  page,
}) => {
  await open(page, "/admin/quizzes");
  await page.getByRole("button", { name: "Create quiz", exact: true }).click();
  let editor = page.getByRole("dialog", { name: "Edit resource" });
  await editor
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("My routing practice");
  await editor
    .getByRole("textbox", { name: "Question", exact: true })
    .fill("Which layer routes packets?");
  for (const [i, option] of [
    "Network",
    "Physical",
    "Session",
    "Presentation",
  ].entries())
    await editor
      .getByRole("textbox", { name: `Question 1 option ${i + 1}` })
      .fill(option);
  await editor
    .getByRole("textbox", { name: "Explanation", exact: true })
    .fill("The Network layer handles routing.");
  await editor.getByRole("button", { name: "Save quiz", exact: true }).click();
  await expect(editor).toHaveCount(0);
  const quiz = (await state(page)).quizzes.find(
    (q: { title: string }) => q.title === "My routing practice",
  );
  await open(page, `/quiz/${quiz.id}`);
  await page.getByRole("button", { name: "I’m ready to try" }).click();
  await page.locator(".answer-option").filter({ hasText: "Network" }).click();
  await page
    .getByRole("button", { name: "Finish practice", exact: true })
    .click();
  await expect(page.locator(".score-display")).toContainText("1");
  expect((await state(page)).attempts[0].score).toBe(1);
  await open(page, "/admin/flashcards");
  await page
    .getByRole("button", { name: "Create flashcard set", exact: true })
    .click();
  editor = page.getByRole("dialog", { name: "Edit resource" });
  await editor
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("My tiny revision set");
  await editor
    .getByRole("textbox", { name: "Front · a good question" })
    .fill("What is a LAN?");
  await editor
    .getByRole("textbox", { name: "Back · the lightbulb moment" })
    .fill("A local area network.");
  await editor
    .getByRole("button", { name: "Save study set", exact: true })
    .click();
  await expect(editor).toHaveCount(0);
  const deck = (await state(page)).decks.find(
    (d: { title: string }) => d.title === "My tiny revision set",
  );
  await open(page, `/flashcards/${deck.id}`);
  await page.getByRole("button", { name: "Let’s see the answer" }).click();
  await expect(page.locator(".flashcard-text")).toHaveText(
    "A local area network.",
  );
});

test("valid backup restore is confirmed, persists, and preserves study data", async ({
  page,
}) => {
  await open(page, "/profile");
  const backup = await state(page);
  backup.profile.name = "Restored learner";
  backup.bookmarks = [backup.notes[0].id];
  await page.getByLabel("Restore workspace backup").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  expect((await state(page)).profile.name).toBe("Learner");
  await page
    .getByRole("button", { name: "Restore this backup", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "What should we call you?" }),
  ).toHaveValue("Restored learner");
  expect((await state(page)).bookmarks).toEqual(backup.bookmarks);
});

test("Gemini streaming UI keeps keys out of local backups and supports chat renaming", async ({
  page,
}) => {
  const key = "browser-test-key-not-real";
  await page.route("**/api/ai/chat", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.apiKey).toBe(key);
    expect(body.context).toContain("Computer Networks");
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: 'data: {"candidates":[{"content":{"parts":[{"text":"Routing happens at the Network layer."}]}}]}\n\n',
    });
  });
  await open(page, "/ai");
  await page
    .getByRole("button", { name: "Connect Gemini", exact: true })
    .click();
  await page.getByLabel("Gemini API key").fill(key);
  await page
    .getByRole("button", { name: "Save connection", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Message your study companion" })
    .fill("Which layer handles routing?");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".chat-message.assistant")).toContainText(
    "Routing happens at the Network layer.",
  );
  expect(JSON.stringify(await state(page))).not.toContain(key);
  await page.getByRole("button", { name: /Rename chat/ }).click();
  await page
    .getByRole("textbox", { name: "Conversation name" })
    .fill("Routing revision");
  await page.getByRole("button", { name: "Save name", exact: true }).click();
  expect((await state(page)).chats[0].name).toBe("Routing revision");
});

test("library imports merge valid content and reject inconsistent question IDs", async ({
  page,
}) => {
  await open(page, "/admin");
  const original = await state(page);
  const note = {
    ...original.notes[0],
    id: "imported-note",
    title: "An imported idea",
  };
  await page.getByLabel("Import content JSON").setInputFiles({
    name: "library.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ notes: [note] })),
  });
  await page
    .getByRole("button", { name: "Import resources", exact: true })
    .click();
  await expect(
    page.getByText("An imported idea", { exact: true }),
  ).toBeVisible();
  const before = await state(page);
  const quiz = {
    ...original.quizzes[0],
    id: "invalid-quiz",
    questions: [
      original.quizzes[0].questions[0],
      original.quizzes[0].questions[0],
    ],
  };
  await page.getByLabel("Import content JSON").setInputFiles({
    name: "broken-library.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ quizzes: [quiz] })),
  });
  await page
    .getByRole("button", { name: "Import resources", exact: true })
    .click();
  await expect(page.locator(".inline-error")).toContainText(
    "duplicate card/question IDs",
  );
  expect(await state(page)).toEqual(before);
  await page.reload();
  await expect(
    page.getByText("An imported idea", { exact: true }),
  ).toBeVisible();
});
