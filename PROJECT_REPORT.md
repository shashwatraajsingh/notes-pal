# Notes Pal architecture

Notes Pal is a browser-local study workspace built with Next.js, React, TypeScript, and plain CSS. It requires no environment variables or database.

## Data flow

`src/data/notes.json` and the quiz/flashcard seeds in `src/lib/workspace.ts` initialize each browser’s workspace. A versioned Zod schema validates saved data and JSON imports. The React workspace component loads data after hydration and persists changes to localStorage. Invalid saved data is preserved and a recovery banner directs users to backup/restore tools.

All content management is local to the browser. There is no public admin endpoint or shared user directory. Content studio handles notes, quizzes, flashcards, publishing flags, feedback, and local insights. Resource exports merge by ID; full workspace restores replace state after confirmation. Payments, referral balances, account management, and device restrictions were retired along with their integrations.

The optional `/api/ai/chat` endpoint validates a bounded request, forwards the user-supplied Gemini key in a provider header, includes published note text as reference context, and relays the SSE response. It stores no keys or conversations. Chat history remains in the browser. Without a key the companion retrieves relevant note passages locally.

## Files

- `src/app/[[...path]]/page.tsx`: route entrypoint for the workspace and study views.
- `src/components/workspace.tsx`: dashboard, navigation, notes, quizzes, flashcards, companion, preferences, feedback, and progress.
- `src/components/content-manager.tsx`: resource editors, import/export, feedback management, and local insights.
- `src/lib/workspace.ts`: versioned schemas, starter content, quiz state transitions, filtering, and import validation.
- `src/app/api/ai/chat/route.ts`: optional streaming Gemini proxy.
- `src/app/globals.css`: responsive design, dark mode, reduced motion, and print styles.
- `tests`: domain tests, AI endpoint tests, and desktop/mobile browser flows.

The original hosted content and database records are not available in the repository. The existing ten sample notes and bundled PDF are retained. See README.md for setup, import formats, privacy, and validation commands.
