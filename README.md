# Notes Pal

A free, browser-local engineering study workspace. Open it and start learning—no account, database, payment provider, or CMS is needed.

## Run locally

Use Node.js 20.9 or newer (Node 22 LTS recommended).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. **No environment variables are required.** For production:

```sh
npm run build
npm start
```

Nixpacks deployment uses the same npm install/build/start workflow. Deploy to a Node-capable host; the optional Gemini proxy requires a server runtime.

## What works

- Responsive dashboard, light/dark themes, academic preferences, daily goals, and progress history.
- Searchable notes with university, degree, year, semester, subject, and resource-type filters; bookmarks and reading completion.
- Markdown notes with headings, tables, code, images, LaTeX, PDF previews/downloads, YouTube embeds, table of contents, font controls, and related notes.
- Randomized timed quizzes with saved answers, resumable deadlines, scoring, explanations, repeat attempts, and history. Completed results retain a question snapshot when the source quiz changes.
- Flashcard sets with reveal, previous/next review, confidence tracking, resume, and completion history.
- A notes companion that retrieves passages from the local library without a key. Connect a personal Gemini API key for streamed conversational AI using the actual published note text as context.
- Content studio for creating/editing/deleting notes, quizzes, and flashcard sets, publishing drafts, reviewing feedback, and inspecting local activity totals.
- JSON library import/export and complete workspace backup/restore with validation and explicit replacement confirmation.

Ten existing sample notes and the repository’s PDF are bundled. Hosted Sanity/Postgres data is not included in this Git repository and is not automatically migrated. Add materials in Content studio or import a JSON library.

## Storage and privacy

Content and study history are saved in `localStorage` under `notes-pal-workspace-v1`. Each browser/origin has its own workspace. Content studio is a personal editor; changes are not published to other users or to the deployment. To share a custom library, export its JSON and import it in the other browser. A link alone only opens resources already present in the recipient’s workspace.

Export backups regularly, especially before clearing browser storage. Saving errors are shown in the app; corrupt saved data is preserved until you explicitly restore or reset it. Browser storage quotas apply. Uploaded PDFs are embedded in backups and limited to 1 MB per file; use hosted HTTPS PDF URLs for larger documents.

A Gemini key is optional. It is kept in the current tab’s `sessionStorage`, excluded from backups, and sent to `/api/ai/chat` only for Gemini requests. The server forwards it in a header to Google, without saving it. Questions, recent chat history, and relevant note text are sent to Google for these requests. Model availability and quota depend on the user’s Gemini account; change the model name in connection settings if necessary.

There are no analytics trackers, Google OAuth, Razorpay calls, Telegram notifications, Prisma queries, Sanity clients, or anti-copy/fullscreen restrictions. External media contacts its host when opened. Previous account, payment, subscription, coupon, referral-wallet, and device-access management screens were retired with the services they depended on. `/sign-in`, `/premium`, and onboarding links now explain free access instead of requesting credentials or payment.

## Library format

Export from Content studio for a complete example. Imports merge by resource ID and preserve study history. A workspace restore instead replaces all data after confirmation.

```json
{
  "notes": [
    {
      "id": "my-first-note",
      "title": "A useful idea",
      "subject": "Computer Networks",
      "summary": "A brief introduction",
      "body": "# A useful idea\n\nWrite your explanation here.",
      "kind": "Notes",
      "university": "AKTU",
      "degree": "B.Tech CSE",
      "year": "3",
      "semester": "5",
      "pdfUrl": "",
      "videoUrl": "",
      "published": true
    }
  ]
}
```

Supported kinds: `Notes`, `PYQ`, `MST`, `One-shot`, `Video`, `Handwritten`. The schemas in `src/lib/workspace.ts` define the quiz and flashcard formats. URLs accept HTTPS and local `/paths`; uploaded PDFs also accept PDF data URLs. Imports are limited to 8 MB.

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Unit tests cover answer identity during randomization, deadlines, scoring, safe backup validation, filters, media URLs, and Gemini proxy handling. Browser tests run against the production build on desktop and mobile, covering persistence, study flows, content editing, backup recovery, feedback, and themes. Gemini transport is tested with simulated provider responses; no live key is required by the test suite.
