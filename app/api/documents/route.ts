import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import {
  extractText,
  getDocumentProxy,
} from "unpdf";
import { logUsage } from "@/lib/usage";
import { checkUsageLimit } from "@/lib/limits";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // -------------------------
    // 1. CHECK USER LOGIN
    // -------------------------

    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // -------------------------
    // 2. CHECK MONTHLY USAGE
    // -------------------------

    const usage = await checkUsageLimit(
      user.userId
    );

    if (!usage.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Monthly limit reached. Your ${usage.plan} plan allows ${usage.limit} requests per month.`,
        },
        { status: 429 }
      );
    }

    // -------------------------
    // 3. GET UPLOADED FILE
    // -------------------------

    const formData = await request.formData();

    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "No file uploaded",
        },
        { status: 400 }
      );
    }

    // -------------------------
    // 4. CHECK FILE TYPE
    // -------------------------

    const fileName = file.name.toLowerCase();

    if (
      !fileName.endsWith(".pdf") &&
      !fileName.endsWith(".txt")
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only PDF and TXT files are supported",
        },
        { status: 400 }
      );
    }

    // -------------------------
    // 5. CHECK FILE SIZE
    // -------------------------

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: "File must be smaller than 10MB",
        },
        { status: 400 }
      );
    }

    let text = "";

    // -------------------------
    // 6. TXT FILE
    // -------------------------

    if (fileName.endsWith(".txt")) {
      text = await file.text();
    }

    // -------------------------
    // 7. PDF FILE
    // -------------------------

    if (fileName.endsWith(".pdf")) {
      const buffer = await file.arrayBuffer();

      const pdf = await getDocumentProxy(
        new Uint8Array(buffer)
      );

      const extracted = await extractText(pdf, {
        mergePages: true,
      });

      text = extracted.text;
    }

    // -------------------------
    // 8. CHECK EXTRACTED TEXT
    // -------------------------

    if (!text.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Could not extract text from document",
        },
        { status: 400 }
      );
    }

    // Keep request size reasonable
    text = text.slice(0, 30000);

    // -------------------------
    // 9. CREATE GEMINI PROMPT
    // -------------------------

    const prompt = `
You are HZX AI Document Analyzer.

Analyze the following document.

Provide:

## Summary
Give a clear summary.

## Key Points
List the most important points.

## Important Details
Mention important names, dates, numbers,
requirements or facts.

## Conclusion
Give a short conclusion.

Keep the response useful and easy to understand.

Return the response in Markdown format.

DOCUMENT:

${text}
`;

    // -------------------------
    // 10. GENERATE AI RESPONSE
    // -------------------------

    const response =
      await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

    const result = response.text || "";

    // -------------------------
    // 11. LOG SUCCESSFUL USAGE
    // -------------------------

    if (result.trim()) {
      await logUsage(
        user.userId,
        "documents"
      );
    }

    // -------------------------
    // 12. SEND RESULT
    // -------------------------

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "DOCUMENT API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to analyze document",
      },
      { status: 500 }
    );
  }
}
