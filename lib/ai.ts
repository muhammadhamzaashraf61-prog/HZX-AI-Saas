import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing");
}

const ai = new GoogleGenAI({
  apiKey,
});

type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function generateAIStream(
  messages: AIMessage[]
) {
  const contents = messages.map((message) => ({
    role: message.role === "assistant"
      ? "model"
      : "user",

    parts: [
      {
        text: message.content,
      },
    ],
  }));

  return ai.models.generateContentStream({
    model: "gemini-3.5-flash-lite",
    contents,
  });
}