import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { logUsage } from "@/lib/usage";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

export async function POST(request: NextRequest) {
  try {
    // Check if user is logged in
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

    // Get request data
    const body = await request.json();

    const topic = body.topic?.trim();
    const tone = body.tone || "Professional";
    const length = body.length || "Medium";

    // Validate topic
    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          message: "Topic is required",
        },
        { status: 400 }
      );
    }

    // Create AI prompt
    const prompt = `
You are HZX AI Writer.

Write high-quality content based on the user's request.

Topic:
${topic}

Tone:
${tone}

Length:
${length}

Instructions:
- Give a clear and useful response.
- Use proper headings where appropriate.
- Use paragraphs and bullet points when useful.
- Do not mention that you are an AI.
- Do not add unnecessary introductions.
- Return the final content in Markdown format.
`;

    // Generate content with Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const content = response.text || "";

    // Log successful AI usage
    if (content.trim()) {
      await logUsage(user.userId, "writer");
    }

    // Send result to frontend
    return NextResponse.json({
      success: true,
      content,
    });
  } catch (error) {
    console.error("WRITER API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate content",
      },
      { status: 500 }
    );
  }
}