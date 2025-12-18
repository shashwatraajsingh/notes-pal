/**
 * Script to seed sample notes for 5th semester CSE
 * Supports both Rich Text (JSON) and PDF uploads
 *
 * Run with: npx tsx --env-file=.env.local scripts/seed-notes.ts
 *
 * For PDF uploads, place PDF files in: scripts/pdfs/
 */

import "dotenv/config";
import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    token: process.env.SANITY_API_WRITE_TOKEN!, // Need write token
    apiVersion: "2024-01-01",
    useCdn: false,
});

// Types for notes
interface BaseNote {
    title: string;
    slug: string;
    subject: string;
    syllabus: string;
    isPremium?: boolean;
    tier?: "TIER_1" | "TIER_2" | "TIER_3";
    type: "NOTES" | "MST" | "PYQ" | "ONE-SHOT" | "VIDEO-MATERIAL" | "HANDWRITTEN-NOTES";
}

interface RichTextNote extends BaseNote {
    contentType: "richtext";
    content: string; // Markdown-like content
}

interface PdfNote extends BaseNote {
    contentType: "pdf";
    pdfPath: string; // Path to PDF file
    pdfFileName?: string; // Display name for PDF
}

interface BothNote extends BaseNote {
    contentType: "both";
    pdfPath: string;
    pdfFileName?: string;
    content: string;
}

type NoteData = RichTextNote | PdfNote | BothNote;

// 5th Semester CSE Sample Notes
const sampleNotes: NoteData[] = [
    // Rich Text Notes
    {
        title: "Unit 1: Introduction to Software Engineering",
        slug: "software-engineering-unit-1-introduction",
        subject: "Software Engineering",
        syllabus:
            "Software Crisis, Software Characteristics, Software Engineering Paradigm, SDLC, Process Models - Waterfall, Spiral, Agile, Incremental",
        contentType: "richtext",
        content: `
# Introduction to Software Engineering

## What is Software Engineering?

Software Engineering is the systematic approach to the development, operation, maintenance, and retirement of software. It applies engineering principles to software development.

## Software Crisis

The software crisis refers to the difficulty of writing useful and efficient computer programs in the required time. Key problems include:

- **Cost Overruns** - Projects exceeding budget
- **Time Delays** - Missing deadlines
- **Poor Quality** - Bugs and failures
- **Maintenance Issues** - Difficult to update

## Software Characteristics

1. **Software is developed, not manufactured**
2. **Software doesn't wear out** (but it deteriorates)
3. **Most software is custom-built**

## SDLC Models

### Waterfall Model
Linear sequential approach:
1. Requirements → 2. Design → 3. Implementation → 4. Testing → 5. Deployment → 6. Maintenance

### Spiral Model
Risk-driven approach combining iterative development with systematic aspects of waterfall.

### Agile Model
Iterative approach with:
- Sprint-based development
- Continuous feedback
- Flexible requirements
`,
        isPremium: false,
        type: "NOTES",
    },
    {
        title: "Unit 2: Requirements Engineering",
        slug: "software-engineering-unit-2-requirements",
        subject: "Software Engineering",
        syllabus:
            "Requirements Gathering, SRS Document, Functional and Non-Functional Requirements, Use Case Diagrams, DFD",
        contentType: "richtext",
        content: `
# Requirements Engineering

## What is Requirements Engineering?

Requirements Engineering is the process of defining, documenting, and maintaining requirements in the engineering design process.

## Types of Requirements

### Functional Requirements
- What the system should DO
- Example: "User should be able to login"

### Non-Functional Requirements
- How the system should BEHAVE
- Performance, Security, Usability, Reliability

## SRS Document (Software Requirements Specification)

SRS describes:
1. Purpose and Scope
2. Overall Description
3. Specific Requirements
4. Appendices

## Use Case Diagrams

Shows:
- **Actors** - External entities
- **Use Cases** - Functions/features
- **Relationships** - Interactions
`,
        isPremium: false,
        type: "NOTES",
    },
    {
        title: "Unit 1: Introduction to Computer Networks",
        slug: "computer-networks-unit-1-introduction",
        subject: "Computer Networks",
        syllabus:
            "Network Definition, LAN, WAN, MAN, Network Topologies, OSI Model, TCP/IP Model",
        contentType: "richtext",
        content: `
# Introduction to Computer Networks

## What is a Computer Network?

A computer network is a collection of interconnected devices that can communicate and share resources.

## Types of Networks

### LAN (Local Area Network)
- Small geographical area
- High speed (100 Mbps - 10 Gbps)

### WAN (Wide Area Network)
- Large geographical area
- Example: Internet

### MAN (Metropolitan Area Network)
- City-wide coverage

## Network Topologies

1. **Bus Topology** - All devices on single cable
2. **Star Topology** - Central hub connection
3. **Ring Topology** - Circular connection
4. **Mesh Topology** - Every device connected

## OSI Model (7 Layers)

| Layer | Name | Function |
|-------|------|----------|
| 7 | Application | User interface |
| 6 | Presentation | Data formatting |
| 5 | Session | Session management |
| 4 | Transport | End-to-end delivery |
| 3 | Network | Routing |
| 2 | Data Link | Frame transmission |
| 1 | Physical | Bit transmission |
`,
        isPremium: false,
        type: "NOTES",
    },
    {
        title: "Unit 2: Data Link Layer",
        slug: "computer-networks-unit-2-data-link-layer",
        subject: "Computer Networks",
        syllabus:
            "Framing, Error Detection, Flow Control, MAC, Ethernet, Switching",
        contentType: "richtext",
        content: `
# Data Link Layer

## Functions of Data Link Layer

1. **Framing** - Dividing data into frames
2. **Error Control** - Detecting and correcting errors
3. **Flow Control** - Managing transmission rate
4. **Access Control** - Determining transmission rights

## Error Detection Methods

### Parity Check
- Single bit for even/odd check

### CRC (Cyclic Redundancy Check)
- Polynomial division based
- Used in Ethernet, WiFi

### Checksum
- Sum of data segments
- Used in TCP/IP

## Flow Control

### Stop-and-Wait
- Send one frame, wait for ACK

### Sliding Window
- Multiple frames before ACK
- Go-Back-N and Selective Repeat
`,
        isPremium: false,
        type: "NOTES",
    },
    {
        title: "Unit 1: Automata Theory Basics",
        slug: "toc-unit-1-automata-basics",
        subject: "Theory of Computation",
        syllabus:
            "Alphabet, Strings, Languages, DFA, NFA, Regular Expressions, Pumping Lemma",
        contentType: "richtext",
        content: `
# Automata Theory Basics

## Basic Definitions

### Alphabet (Σ)
A finite, non-empty set of symbols.
Example: Σ = {0, 1}

### String
A finite sequence of symbols.
- Empty string: ε (epsilon)

### Language
A set of strings over an alphabet.

## Finite Automata

### DFA (Deterministic Finite Automaton)
- Exactly ONE transition per symbol
- 5-tuple: (Q, Σ, δ, q0, F)

### NFA (Non-deterministic Finite Automaton)
- Zero or more transitions
- Can have ε-transitions

## Regular Expressions

- **Union (|)**: a|b
- **Concatenation**: ab
- **Kleene Star (*)**: a*
- **Plus (+)**: a+
`,
        isPremium: false,
        type: "NOTES",
    },
    {
        title: "Unit 2: Context-Free Grammars",
        slug: "toc-unit-2-cfg",
        subject: "Theory of Computation",
        syllabus: "CFG, Derivations, Parse Trees, CNF, GNF, PDA",
        contentType: "richtext",
        content: `
# Context-Free Grammars

## What is a CFG?

A Context-Free Grammar is G = (V, T, P, S):
- **V**: Non-terminals
- **T**: Terminals
- **P**: Production rules
- **S**: Start symbol

## Example CFG

Grammar for balanced parentheses:
S → (S) | SS | ε

## Parse Trees

Visual representation of derivation:
- Root is start symbol
- Leaves are terminals

## Chomsky Normal Form (CNF)

All productions are:
- A → BC (two variables)
- A → a (single terminal)

## Pushdown Automata (PDA)

FA + Stack = PDA
- Can recognize context-free languages
`,
        isPremium: true,
        tier: "TIER_1",
        type: "NOTES",
    },
    {
        title: "Unit 1: Introduction to Compilers",
        slug: "compiler-design-unit-1-introduction",
        subject: "Compiler Design",
        syllabus: "Compiler Structure, Phases, Lexical Analysis, Tokens, LEX Tool",
        contentType: "richtext",
        content: `
# Introduction to Compilers

## What is a Compiler?

A compiler translates source code into machine code.

## Phases of Compilation

### Analysis Phase (Front End)
1. **Lexical Analysis** - Tokenization
2. **Syntax Analysis** - Parsing
3. **Semantic Analysis** - Type checking

### Synthesis Phase (Back End)
4. **Intermediate Code Generation**
5. **Code Optimization**
6. **Code Generation**

## Lexical Analysis

Groups characters into lexemes.

### Key Terms
- **Token**: Category (IDENTIFIER, NUMBER)
- **Pattern**: Rule describing token
- **Lexeme**: Actual string matched

### Example
Source: int x = 5;

Tokens:
- (KEYWORD, "int")
- (IDENTIFIER, "x")
- (OPERATOR, "=")
- (NUMBER, "5")
`,
        isPremium: false,
        type: "NOTES",
    },
    {
        title: "Unit 2: Syntax Analysis",
        slug: "compiler-design-unit-2-syntax-analysis",
        subject: "Compiler Design",
        syllabus: "Parsing, Top-Down, LL(1), Bottom-Up, LR, SLR, CLR, LALR",
        contentType: "richtext",
        content: `
# Syntax Analysis (Parsing)

## Role of Parser

1. Takes tokens from lexical analyzer
2. Checks grammar rules
3. Builds parse tree
4. Reports syntax errors

## Types of Parsers

### Top-Down Parsing
- Recursive Descent Parser
- LL(1) Parser

### Bottom-Up Parsing

#### LR Parsing Family
- **SLR** - Simple LR
- **CLR** - Canonical LR (most powerful)
- **LALR** - Used by YACC/Bison

## Parsing Table Construction

For LL(1):
1. Compute FIRST sets
2. Compute FOLLOW sets
3. Fill table using rules
`,
        isPremium: true,
        tier: "TIER_2",
        type: "NOTES",
    },
    {
        title: "Unit 1: Introduction to Computer Graphics",
        slug: "computer-graphics-unit-1-introduction",
        subject: "Computer Graphics",
        syllabus: "Display Devices, Raster vs Vector, Line Drawing - DDA, Bresenham",
        contentType: "richtext",
        content: `
# Introduction to Computer Graphics

## Display Devices

### CRT (Cathode Ray Tube)
- Electron beam hits phosphor screen

### LCD (Liquid Crystal Display)
- Liquid crystals control light

## Raster vs Vector Graphics

### Raster (Bitmap)
- Made of pixels
- Formats: JPEG, PNG

### Vector
- Mathematical equations
- Formats: SVG, AI

## Line Drawing Algorithms

### DDA Algorithm

Steps:
1. Calculate dx, dy
2. steps = max(|dx|, |dy|)
3. Plot points incrementally

### Bresenham's Algorithm

Uses only integer arithmetic!
Much faster than DDA.
`,
        isPremium: false,
        type: "NOTES",
    },
    {
        title: "Unit 2: 2D Transformations",
        slug: "computer-graphics-unit-2-transformations",
        subject: "Computer Graphics",
        syllabus: "Translation, Rotation, Scaling, Reflection, Homogeneous Coordinates",
        contentType: "richtext",
        content: `
# 2D Transformations

## Basic Transformations

### Translation
Moving by (tx, ty):
- x' = x + tx
- y' = y + ty

### Scaling
By (sx, sy):
- x' = x × sx
- y' = y × sy

### Rotation
By angle θ about origin:
- x' = x×cos(θ) - y×sin(θ)
- y' = x×sin(θ) + y×cos(θ)

### Reflection
Mirror image across axis.

## Homogeneous Coordinates

3x3 matrices for 2D transformations.
Allows combining all transformations.

## Composite Transformations

T = T3 × T2 × T1
Order matters!
`,
        isPremium: true,
        tier: "TIER_1",
        type: "NOTES",
    },
];

// Example PDF notes - these would use actual PDF files
// Uncomment and add your PDF files to scripts/pdfs/ folder
/*
const pdfNotes: PdfNote[] = [
  {
    title: "Software Engineering Complete Notes",
    slug: "se-complete-notes-pdf",
    subject: "Software Engineering",
    syllabus: "Complete syllabus covered in PDF format",
    contentType: "pdf",
    pdfPath: "scripts/pdfs/software-engineering-notes.pdf",
    pdfFileName: "Software Engineering Complete Notes.pdf",
    isPremium: true,
    tier: "TIER_2",
    type: "NOTES",
  },
  {
    title: "Computer Networks PYQ 2023",
    slug: "cn-pyq-2023-pdf",
    subject: "Computer Networks",
    syllabus: "Previous Year Questions 2023",
    contentType: "pdf",
    pdfPath: "scripts/pdfs/cn-pyq-2023.pdf",
    pdfFileName: "CN PYQ 2023.pdf",
    isPremium: false,
    type: "PYQ",
  },
];
*/

// Helper to create portable text blocks from markdown-like content
function createPortableText(content: string) {
    const blocks: any[] = [];
    const lines = content.trim().split("\n");
    let currentParagraph = "";

    for (const line of lines) {
        if (line.startsWith("# ")) {
            if (currentParagraph) {
                blocks.push(createTextBlock(currentParagraph, "normal"));
                currentParagraph = "";
            }
            blocks.push(createTextBlock(line.slice(2), "h1"));
        } else if (line.startsWith("## ")) {
            if (currentParagraph) {
                blocks.push(createTextBlock(currentParagraph, "normal"));
                currentParagraph = "";
            }
            blocks.push(createTextBlock(line.slice(3), "h2"));
        } else if (line.startsWith("### ")) {
            if (currentParagraph) {
                blocks.push(createTextBlock(currentParagraph, "normal"));
                currentParagraph = "";
            }
            blocks.push(createTextBlock(line.slice(4), "h3"));
        } else if (line.startsWith("#### ")) {
            if (currentParagraph) {
                blocks.push(createTextBlock(currentParagraph, "normal"));
                currentParagraph = "";
            }
            blocks.push(createTextBlock(line.slice(5), "h4"));
        } else if (line.startsWith("- ")) {
            if (currentParagraph) {
                blocks.push(createTextBlock(currentParagraph, "normal"));
                currentParagraph = "";
            }
            blocks.push(createListBlock(line.slice(2), "bullet"));
        } else if (/^\d+\. /.test(line)) {
            if (currentParagraph) {
                blocks.push(createTextBlock(currentParagraph, "normal"));
                currentParagraph = "";
            }
            blocks.push(createListBlock(line.replace(/^\d+\. /, ""), "number"));
        } else if (line.trim() === "") {
            if (currentParagraph) {
                blocks.push(createTextBlock(currentParagraph, "normal"));
                currentParagraph = "";
            }
        } else {
            currentParagraph += (currentParagraph ? " " : "") + line.trim();
        }
    }

    if (currentParagraph) {
        blocks.push(createTextBlock(currentParagraph, "normal"));
    }

    return blocks;
}

function createTextBlock(
    text: string,
    style: "normal" | "h1" | "h2" | "h3" | "h4" = "normal"
) {
    return {
        _type: "block",
        _key: generateKey(),
        style,
        markDefs: [],
        children: [
            {
                _type: "span",
                _key: generateKey(),
                text,
                marks: [],
            },
        ],
    };
}

function createListBlock(text: string, listItem: "bullet" | "number") {
    return {
        _type: "block",
        _key: generateKey(),
        style: "normal",
        listItem,
        level: 1,
        markDefs: [],
        children: [
            {
                _type: "span",
                _key: generateKey(),
                text,
                marks: [],
            },
        ],
    };
}

function generateKey() {
    return Math.random().toString(36).substring(2, 12);
}

// Upload PDF file to Sanity and return asset reference
async function uploadPdf(pdfPath: string): Promise<{ _ref: string; _type: "reference" } | null> {
    try {
        const absolutePath = path.resolve(pdfPath);

        if (!fs.existsSync(absolutePath)) {
            console.error(`  ❌ PDF file not found: ${absolutePath}`);
            return null;
        }

        const fileBuffer = fs.readFileSync(absolutePath);
        const fileName = path.basename(pdfPath);

        console.log(`  📤 Uploading PDF: ${fileName}`);

        const asset = await client.assets.upload("file", fileBuffer, {
            filename: fileName,
            contentType: "application/pdf",
        });

        console.log(`  ✅ PDF uploaded: ${asset._id}`);

        return {
            _ref: asset._id,
            _type: "reference",
        };
    } catch (error) {
        console.error(`  ❌ Failed to upload PDF: ${error}`);
        return null;
    }
}

async function seedNotes() {
    console.log("🌱 Starting to seed 5th semester notes...\n");
    console.log("━".repeat(50));

    let successCount = 0;
    let failCount = 0;

    for (const note of sampleNotes) {
        try {
            console.log(`\n📝 Creating: ${note.title}`);

            const doc: any = {
                _type: "note",
                title: note.title,
                slug: {
                    _type: "slug",
                    current: note.slug,
                },
                university: "AKTU",
                degree: "btech-cse",
                year: "3rd-year",
                semester: "5th-semester",
                subject: note.subject,
                syllabus: note.syllabus,
                type: note.type,
                isPremium: note.isPremium || false,
                tier: note.tier || null,
                contentType: note.contentType,
            };

            // Handle different content types
            if (note.contentType === "richtext") {
                doc.content = createPortableText(note.content);
            } else if (note.contentType === "pdf") {
                const pdfAsset = await uploadPdf(note.pdfPath);
                if (pdfAsset) {
                    doc.pdfFile = {
                        _type: "file",
                        asset: pdfAsset,
                    };
                    doc.pdfFileName = note.pdfFileName || path.basename(note.pdfPath);
                } else {
                    console.log(`  ⚠️ Skipping note due to PDF upload failure`);
                    failCount++;
                    continue;
                }
            } else if (note.contentType === "both") {
                doc.content = createPortableText(note.content);
                const pdfAsset = await uploadPdf(note.pdfPath);
                if (pdfAsset) {
                    doc.pdfFile = {
                        _type: "file",
                        asset: pdfAsset,
                    };
                    doc.pdfFileName = note.pdfFileName || path.basename(note.pdfPath);
                }
            }

            const result = await client.create(doc);

            console.log(`  ✅ Created successfully!`);
            console.log(`  📌 ID: ${result._id}`);
            console.log(`  📚 Subject: ${note.subject}`);
            console.log(`  💎 Premium: ${note.isPremium ? `Yes (${note.tier})` : "No"}`);
            console.log(`  📄 Content Type: ${note.contentType}`);

            successCount++;
        } catch (error: any) {
            console.error(`  ❌ Failed to create: ${note.title}`);
            console.error(`  Error: ${error.message}`);
            failCount++;
        }
    }

    console.log("\n" + "━".repeat(50));
    console.log("\n🎉 Seeding complete!");
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log(`📊 Total: ${sampleNotes.length}`);
    console.log(
        `📚 Subjects: ${[...new Set(sampleNotes.map((n) => n.subject))].join(", ")}`
    );
}

// Show usage info
function showUsage() {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║            Notes Pal - Seed Notes Script                   ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  This script creates sample notes for 5th semester CSE.   ║
║                                                            ║
║  USAGE:                                                    ║
║    npx tsx --env-file=.env.local scripts/seed-notes.ts    ║
║                                                            ║
║  REQUIREMENTS:                                             ║
║    • NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local          ║
║    • NEXT_PUBLIC_SANITY_DATASET in .env.local             ║
║    • SANITY_API_WRITE_TOKEN in .env.local                 ║
║                                                            ║
║  GET WRITE TOKEN:                                          ║
║    1. Go to sanity.io/manage                              ║
║    2. Select your project                                  ║
║    3. API → Tokens → Add API Token                        ║
║    4. Name: "Seed Script", Permissions: "Editor"          ║
║                                                            ║
║  FOR PDF NOTES:                                            ║
║    1. Create folder: scripts/pdfs/                        ║
║    2. Place PDF files there                                ║
║    3. Update pdfNotes array in this script                ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);
}

// Check if required env vars are present
function checkEnvVars(): boolean {
    const required = [
        "NEXT_PUBLIC_SANITY_PROJECT_ID",
        "NEXT_PUBLIC_SANITY_DATASET",
        "SANITY_API_WRITE_TOKEN",
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        console.error("❌ Missing required environment variables:");
        missing.forEach((key) => console.error(`   • ${key}`));
        console.log("\n");
        showUsage();
        return false;
    }

    return true;
}

// Main execution
async function main() {
    console.log("\n");

    if (!checkEnvVars()) {
        process.exit(1);
    }

    console.log("🔧 Configuration:");
    console.log(`   Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`   Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    console.log(`   Token: ${"*".repeat(10)}...`);
    console.log("\n");

    await seedNotes();
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
