import { z } from "zod";
import seedNotes from "@/data/notes.json";

const text = z.string().max(100_000);
export const academicSchema = z.object({
  university: z.enum(["ABES EC", "AKTU"]),
  degree: z.enum(["B.Tech CSE", "B.Tech IT"]),
  year: z.enum(["1", "2", "3", "4"]),
  semester: z.enum(["1", "2", "3", "4", "5", "6", "7", "8"]),
});
export const kinds = [
  "Notes",
  "PYQ",
  "MST",
  "One-shot",
  "Video",
  "Handwritten",
] as const;
const id = z
  .string()
  .min(1)
  .max(200)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const resourceUrl = z
  .string()
  .max(2_000)
  .refine(
    (value) => !value || /^\/(?!\/)/.test(value) || /^https:\/\//.test(value),
    "Use an HTTPS URL or a local /path.",
  );
const pdfUrl = z
  .string()
  .max(1_400_000)
  .refine((value) => {
    if (resourceUrl.safeParse(value).success) return true;
    if (!/^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/.test(value))
      return false;
    try {
      return atob(value.split(",")[1]).startsWith("%PDF-");
    } catch {
      return false;
    }
  }, "Use an HTTPS URL, local path, or an uploaded PDF.");
export const noteSchema = academicSchema.extend({
  id,
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(120),
  summary: z.string().max(2_000),
  body: text,
  kind: z.enum(kinds),
  pdfUrl,
  videoUrl: resourceUrl,
  published: z.boolean(),
});
export const questionSchema = z
  .object({
    id,
    prompt: z.string().trim().min(1).max(4_000),
    options: z.array(z.string().trim().min(1).max(1_000)).min(2).max(6),
    correct: z.number().int().min(0),
    explanation: z.string().max(4_000),
  })
  .refine(
    (q) => q.correct < q.options.length,
    "Correct answer must refer to an option.",
  );
export const quizSchema = academicSchema.extend({
  id,
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(120),
  description: z.string().max(2_000),
  minutes: z.number().int().min(1).max(180),
  questions: z.array(questionSchema).min(1).max(100),
  published: z.boolean(),
});
export const deckSchema = academicSchema.extend({
  id,
  title: z.string().trim().min(1).max(200),
  subject: z.string().trim().min(1).max(120),
  description: z.string().max(2_000),
  cards: z
    .array(
      z.object({
        id,
        front: z.string().trim().min(1).max(4_000),
        back: z.string().trim().min(1).max(8_000),
      }),
    )
    .min(1)
    .max(500),
  published: z.boolean(),
});
const attemptSchema = z
  .object({
    id,
    quizId: id,
    title: z.string(),
    questions: z.array(questionSchema).min(1),
    answers: z.record(z.string(), z.number().int().min(0)),
    startedAt: z.number(),
    deadline: z.number(),
    completedAt: z.number().nullable(),
    score: z.number(),
  })
  .refine(
    (a) =>
      a.questions.every(
        (q) =>
          a.answers[q.id] === undefined || a.answers[q.id] < q.options.length,
      ),
    "Invalid attempt answers.",
  );
const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: text,
});
export const chatSchema = z.object({
  id,
  name: z.string().max(200),
  subject: z.string().max(120),
  model: z.string().max(100),
  messages: z.array(messageSchema).max(200),
});
export const workspaceSchema = z
  .object({
    version: z.literal(1),
    notes: z.array(noteSchema).max(2_000),
    quizzes: z.array(quizSchema).max(500),
    decks: z.array(deckSchema).max(500),
    profile: academicSchema.extend({
      name: z.string().trim().min(1).max(80),
      goal: z.number().int().min(1).max(20),
    }),
    bookmarks: z.array(id),
    completedNotes: z.record(id, z.number()),
    attempts: z.array(attemptSchema).max(2_000),
    reviews: z.record(
      id,
      z.object({
        index: z.number().int().min(0),
        known: z.array(id),
        reviewed: z.array(id),
        finishedAt: z.number().nullable(),
      }),
    ),
    chats: z.array(chatSchema).max(200),
    reports: z
      .array(
        z.object({
          id,
          title: z.string().max(200),
          url: z.string().max(2_000),
          body: z.string().trim().min(1).max(4_000),
          createdAt: z.number(),
          resolved: z.boolean(),
        }),
      )
      .max(1_000),
    theme: z.enum(["light", "dark"]),
  })
  .superRefine((state, ctx) => {
    for (const key of [
      "notes",
      "quizzes",
      "decks",
      "attempts",
      "chats",
      "reports",
    ] as const) {
      const ids = state[key].map((item) => item.id);
      if (new Set(ids).size !== ids.length)
        ctx.addIssue({ code: "custom", message: `Duplicate ${key} IDs.` });
    }
    for (const quiz of state.quizzes)
      if (
        new Set(quiz.questions.map((q) => q.id)).size !== quiz.questions.length
      )
        ctx.addIssue({ code: "custom", message: "Duplicate question IDs." });
    for (const deck of state.decks)
      if (new Set(deck.cards.map((c) => c.id)).size !== deck.cards.length)
        ctx.addIssue({ code: "custom", message: "Duplicate card IDs." });
  });
export type Note = z.infer<typeof noteSchema>;
export type Quiz = z.infer<typeof quizSchema>;
export type Deck = z.infer<typeof deckSchema>;
export type Attempt = z.infer<typeof attemptSchema>;
export type Chat = z.infer<typeof chatSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export type Academic = z.infer<typeof academicSchema>;
export const academic: Academic = {
  university: "AKTU",
  degree: "B.Tech CSE",
  year: "3",
  semester: "5",
};
export const storageKey = "notes-pal-workspace-v1";
export function newId() {
  return crypto.randomUUID();
}
export function shuffle<T>(items: readonly T[], random = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function startAttempt(quiz: Quiz, now = Date.now()): Attempt {
  return {
    id: newId(),
    quizId: quiz.id,
    title: quiz.title,
    questions: shuffle(quiz.questions).map((q) => {
      const options = shuffle(
        q.options.map((label, index) => ({
          label,
          correct: index === q.correct,
        })),
      );
      return {
        ...q,
        options: options.map((o) => o.label),
        correct: options.findIndex((o) => o.correct),
      };
    }),
    answers: {},
    startedAt: now,
    deadline: now + quiz.minutes * 60_000,
    completedAt: null,
    score: 0,
  };
}
export function answerAttempt(
  attempt: Attempt,
  questionId: string,
  option: number,
  now = Date.now(),
): Attempt {
  const question = attempt.questions.find((q) => q.id === questionId);
  if (
    attempt.completedAt !== null ||
    now >= attempt.deadline ||
    !question ||
    !Number.isInteger(option) ||
    option < 0 ||
    option >= question.options.length
  )
    return attempt;
  return { ...attempt, answers: { ...attempt.answers, [questionId]: option } };
}
export function finishAttempt(attempt: Attempt, now = Date.now()): Attempt {
  if (attempt.completedAt !== null) return attempt;
  return {
    ...attempt,
    completedAt: Math.min(now, attempt.deadline),
    score: attempt.questions.filter((q) => attempt.answers[q.id] === q.correct)
      .length,
  };
}
export function filterContent<
  T extends Academic & { title: string; subject: string; published: boolean },
>(
  items: T[],
  query: string,
  filters: Partial<Academic> & { subject?: string },
  includeDrafts = false,
): T[] {
  return items.filter(
    (item) =>
      (includeDrafts || item.published) &&
      `${item.title} ${item.subject} ${"summary" in item ? item.summary : ""}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      Object.entries(filters).every(
        ([key, value]) =>
          !value || value === "all" || item[key as keyof T] === value,
      ),
  );
}
export function parseBackup(text: string): Workspace {
  if (text.length > 8_000_000)
    throw new Error("Backup is too large (8 MB maximum).");
  return workspaceSchema.parse(JSON.parse(text));
}
export function videoEmbed(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (
      !["www.youtube.com", "youtube.com", "youtu.be"].includes(parsed.hostname)
    )
      return null;
    const key =
      parsed.hostname === "youtu.be"
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get("v") || parsed.pathname.split("/embed/")[1];
    return key && /^[\w-]{11}$/.test(key)
      ? `https://www.youtube-nocookie.com/embed/${key}`
      : null;
  } catch {
    return null;
  }
}
export function createWorkspace(): Workspace {
  const notes = noteSchema.array().parse(seedNotes);
  const quizzes: Quiz[] = [
    {
      ...academic,
      id: "network-foundations",
      title: "Network foundations",
      subject: "Computer Networks",
      description:
        "From the OSI model to reliable communication. Put the fundamentals to the test.",
      minutes: 8,
      published: true,
      questions: [
        {
          id: "network-1",
          prompt:
            "Which OSI layer is responsible for routing packets between networks?",
          options: ["Transport", "Network", "Data Link", "Session"],
          correct: 1,
          explanation:
            "The Network layer (layer 3) handles logical addressing and routing.",
        },
        {
          id: "network-2",
          prompt: "Which topology connects every device to a central hub?",
          options: ["Bus", "Ring", "Star", "Mesh"],
          correct: 2,
          explanation:
            "A star topology has a central hub or switch that connects all devices.",
        },
        {
          id: "network-3",
          prompt: "What does CRC primarily detect?",
          options: [
            "Transmission errors",
            "Network congestion",
            "Duplicate IP addresses",
            "Unauthorized users",
          ],
          correct: 0,
          explanation:
            "Cyclic Redundancy Check uses polynomial division to detect changes to transmitted data.",
        },
        {
          id: "network-4",
          prompt:
            "What advantage does a sliding window have over stop-and-wait?",
          options: [
            "No acknowledgments needed",
            "Multiple unacknowledged frames can be in transit",
            "No possibility of errors",
            "Unlimited bandwidth",
          ],
          correct: 1,
          explanation:
            "A sliding window allows multiple frames to be sent before acknowledgment, improving throughput.",
        },
        {
          id: "network-5",
          prompt: "Which OSI layer transmits raw bits through a medium?",
          options: ["Application", "Network", "Physical", "Presentation"],
          correct: 2,
          explanation:
            "The Physical layer defines the electrical, optical, or radio transmission of raw bits.",
        },
      ],
    },
    {
      ...academic,
      id: "software-processes",
      title: "Software engineering essentials",
      subject: "Software Engineering",
      description:
        "Explore development models, requirements, and the software lifecycle.",
      minutes: 6,
      published: true,
      questions: [
        {
          id: "software-1",
          prompt:
            "Which development model organizes work into short iterations with frequent feedback?",
          options: ["Waterfall", "Agile", "Big Bang", "Code-and-fix"],
          correct: 1,
          explanation:
            "Agile development uses short iterations and continuous customer feedback.",
        },
        {
          id: "software-2",
          prompt: "Which is a non-functional requirement?",
          options: [
            "Users can search notes",
            "Users can export reports",
            "Search responds within 200 ms",
            "Users can create flashcards",
          ],
          correct: 2,
          explanation:
            "Response time describes a quality attribute. It specifies how the system performs.",
        },
        {
          id: "software-3",
          prompt: "What is the main focus of the spiral model?",
          options: [
            "Eliminating testing",
            "Risk analysis in repeated cycles",
            "One-pass implementation",
            "Avoiding documentation",
          ],
          correct: 1,
          explanation:
            "The spiral model is risk-driven and combines iteration with systematic risk evaluation.",
        },
        {
          id: "software-4",
          prompt: "What does SRS stand for?",
          options: [
            "Software Requirements Specification",
            "System Runtime Service",
            "Software Review Summary",
            "Structured Release Schedule",
          ],
          correct: 0,
          explanation:
            "An SRS documents a software system’s functional and non-functional requirements.",
        },
      ],
    },
    {
      ...academic,
      id: "compiler-basics",
      title: "Inside a compiler",
      subject: "Compiler Design",
      description:
        "A quick check on tokens, parsing, and the phases of compilation.",
      minutes: 5,
      published: true,
      questions: [
        {
          id: "compiler-1",
          prompt: "Which phase groups characters into tokens?",
          options: [
            "Code generation",
            "Semantic analysis",
            "Lexical analysis",
            "Optimization",
          ],
          correct: 2,
          explanation:
            "Lexical analysis converts a stream of characters into tokens.",
        },
        {
          id: "compiler-2",
          prompt: "Which parser family works from the bottom up?",
          options: ["LL", "Recursive descent", "LR", "Predictive"],
          correct: 2,
          explanation:
            "LR parsers build a parse from leaves toward the start symbol using shift and reduce actions.",
        },
        {
          id: "compiler-3",
          prompt: "What are FIRST and FOLLOW sets used to construct?",
          options: [
            "An LL(1) parsing table",
            "A machine instruction set",
            "A network routing table",
            "A symbol’s memory address",
          ],
          correct: 0,
          explanation:
            "FIRST and FOLLOW sets guide the placement of grammar productions in an LL(1) parsing table.",
        },
      ],
    },
  ];
  const decks: Deck[] = [
    {
      ...academic,
      id: "osi-model",
      title: "The OSI model, unpacked",
      subject: "Computer Networks",
      description:
        "Seven layers. One clear picture. Learn the language of networks.",
      published: true,
      cards: [
        {
          id: "osi-1",
          front: "What are the seven OSI layers, from bottom to top?",
          back: "Physical → Data Link → Network → Transport → Session → Presentation → Application.",
        },
        {
          id: "osi-2",
          front: "What does the Transport layer do?",
          back: "It provides end-to-end data delivery, segmentation, and, depending on the protocol, reliability and flow control.",
        },
        {
          id: "osi-3",
          front: "How do LAN and WAN differ?",
          back: "A LAN covers a small area such as a building. A WAN connects networks over large geographical areas.",
        },
        {
          id: "osi-4",
          front: "What is the purpose of the Data Link layer?",
          back: "Framing, error detection, flow control, and access to the physical medium.",
        },
        {
          id: "osi-5",
          front: "What makes a mesh topology distinctive?",
          back: "Devices have multiple interconnections, providing redundant paths and increased fault tolerance.",
        },
      ],
    },
    {
      ...academic,
      id: "automata",
      title: "Automata in a flash",
      subject: "Theory of Computation",
      description:
        "Build intuition for languages, grammars, and abstract machines.",
      published: true,
      cards: [
        {
          id: "automata-1",
          front: "What is an alphabet (Σ)?",
          back: "A finite, non-empty set of symbols, such as {0, 1}. Strings are finite sequences of these symbols.",
        },
        {
          id: "automata-2",
          front: "How does an NFA differ from a DFA?",
          back: "An NFA can have zero or multiple transitions for a symbol, including epsilon transitions. A DFA has exactly one transition per state and input symbol.",
        },
        {
          id: "automata-3",
          front: "What does a pushdown automaton add to a finite automaton?",
          back: "A stack, which allows it to recognize context-free languages such as balanced parentheses.",
        },
        {
          id: "automata-4",
          front: "What does the Kleene star mean?",
          back: "Zero or more repetitions. For example, a* includes ε, a, aa, aaa, and so on.",
        },
      ],
    },
    {
      ...academic,
      id: "sdlc",
      title: "The software lifecycle",
      subject: "Software Engineering",
      description:
        "Turn the essential development concepts into second nature.",
      published: true,
      cards: [
        {
          id: "sdlc-1",
          front: "What are the typical phases of the SDLC?",
          back: "Requirements → Design → Implementation → Testing → Deployment → Maintenance.",
        },
        {
          id: "sdlc-2",
          front: "Functional vs. non-functional requirements?",
          back: "Functional requirements describe what the system does. Non-functional requirements describe qualities such as performance, security, and usability.",
        },
        {
          id: "sdlc-3",
          front: "What is the waterfall model?",
          back: "A sequential development model in which phases are completed in order, with each phase informing the next.",
        },
      ],
    },
  ];
  return workspaceSchema.parse({
    version: 1,
    notes,
    quizzes,
    decks,
    profile: { ...academic, name: "Learner", goal: 3 },
    bookmarks: [],
    completedNotes: {},
    attempts: [],
    reviews: {},
    chats: [],
    reports: [],
    theme: "light",
  });
}
