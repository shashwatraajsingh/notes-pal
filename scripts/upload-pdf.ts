/**
 * Upload a single PDF note to Sanity
 * Run with: npx tsx --env-file=.env.local scripts/upload-pdf.ts
 */

import "dotenv/config";
import { createClient } from "@sanity/client";
import * as fs from "fs";
import * as path from "path";

// Check environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_EDITOR_TOKEN;

if (!projectId || !dataset) {
    console.error("❌ Missing Sanity project configuration!");
    console.error("   Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET");
    process.exit(1);
}

if (!token) {
    console.error("❌ Missing Sanity write token!");
    console.error("   Required: SANITY_API_WRITE_TOKEN or SANITY_EDITOR_TOKEN");
    console.error("\n   Get one from: https://sanity.io/manage → Your Project → API → Tokens");
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-01-01",
    useCdn: false,
});

// PDF Note Configuration - EDIT THIS!
const pdfConfig = {
    // Path to the PDF file
    pdfPath: "scripts/pdfs/unit 1.pdf",

    // Note metadata
    title: "DAA Unit 1: Introduction to Algorithms",
    slug: "daa-unit-1-introduction-algorithms",
    subject: "Design and Analysis of Algorithms",
    syllabus: "Introduction to Algorithms, Algorithm Analysis, Asymptotic Notations (Big-O, Omega, Theta), Time and Space Complexity, Recurrence Relations, Master Theorem",

    // Academic details
    university: "AKTU", // "ABES EC" or "AKTU"
    degree: "btech-cse", // "btech-cse" or "btech-it"
    year: "3rd-year", // "1st-year", "2nd-year", "3rd-year", "4th-year"
    semester: "5th-semester", // "1st-semester" through "8th-semester"

    // Note type
    type: "NOTES", // "NOTES", "MST", "PYQ", "ONE-SHOT", "VIDEO-MATERIAL", "HANDWRITTEN-NOTES"

    // Premium settings
    isPremium: false,
    tier: null as string | null, // "TIER_1", "TIER_2", "TIER_3", or null for free

    // PDF display name (what user sees when downloading)
    pdfFileName: "DAA Unit 1 Notes.pdf",
};

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

async function uploadPdfNote() {
    console.log("\n📤 Uploading PDF Note to Sanity\n");
    console.log("━".repeat(50));

    // Check if PDF exists
    const absolutePath = path.resolve(pdfConfig.pdfPath);
    if (!fs.existsSync(absolutePath)) {
        console.error(`❌ PDF file not found: ${absolutePath}`);
        process.exit(1);
    }

    console.log(`📄 PDF File: ${pdfConfig.pdfPath}`);
    console.log(`📝 Title: ${pdfConfig.title}`);
    console.log(`📚 Subject: ${pdfConfig.subject}`);
    console.log(`🏫 University: ${pdfConfig.university}`);
    console.log(`📅 Semester: ${pdfConfig.semester}`);
    console.log(`💎 Premium: ${pdfConfig.isPremium ? `Yes (${pdfConfig.tier})` : "No (Free)"}`);
    console.log("\n");

    try {
        // Step 1: Upload PDF as asset
        console.log("⏳ Step 1: Uploading PDF to Sanity Assets...");
        const fileBuffer = fs.readFileSync(absolutePath);
        const fileName = path.basename(pdfConfig.pdfPath);

        const asset = await client.assets.upload("file", fileBuffer, {
            filename: fileName,
            contentType: "application/pdf",
        });

        console.log(`✅ PDF uploaded! Asset ID: ${asset._id}`);

        // Step 2: Create the note document
        console.log("\n⏳ Step 2: Creating note document...");

        const slug = pdfConfig.slug || generateSlug(pdfConfig.title);

        const noteDocument = {
            _type: "note",
            title: pdfConfig.title,
            slug: {
                _type: "slug",
                current: slug,
            },
            syllabus: pdfConfig.syllabus,
            university: pdfConfig.university,
            degree: pdfConfig.degree,
            year: pdfConfig.year,
            semester: pdfConfig.semester,
            subject: pdfConfig.subject,
            type: pdfConfig.type,
            isPremium: pdfConfig.isPremium,
            tier: pdfConfig.isPremium ? pdfConfig.tier : null,
            contentType: "pdf",
            pdfFile: {
                _type: "file",
                asset: {
                    _type: "reference",
                    _ref: asset._id,
                },
            },
            pdfFileName: pdfConfig.pdfFileName || fileName,
        };

        const result = await client.create(noteDocument);

        console.log(`✅ Note created! Document ID: ${result._id}`);

        // Summary
        console.log("\n" + "━".repeat(50));
        console.log("\n🎉 SUCCESS! PDF Note uploaded successfully!\n");
        console.log("📌 Note Details:");
        console.log(`   ID: ${result._id}`);
        console.log(`   Title: ${pdfConfig.title}`);
        console.log(`   Slug: ${slug}`);
        console.log(`   Subject: ${pdfConfig.subject}`);
        console.log(`   URL: /notes/${slug}`);
        console.log("\n✨ You can now view this note in your app!");

    } catch (error: any) {
        console.error("\n❌ Upload failed!");
        console.error(`   Error: ${error.message}`);

        if (error.message?.includes("Insufficient permissions")) {
            console.error("\n💡 Your token doesn't have write permissions.");
            console.error("   Go to sanity.io/manage → API → Tokens → Create new token with 'Editor' role");
        }

        process.exit(1);
    }
}

uploadPdfNote();
