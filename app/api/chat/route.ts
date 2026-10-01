import { NextRequest } from "next/server";
import { getUser } from "@/lib/auth";
import pool from "@/lib/db";
import { generateAIStream } from "@/lib/ai";
import { logUsage } from "@/lib/usage";
import { checkUsageLimit } from "@/lib/limits";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // -------------------------
    // CHECK USER
    // -------------------------

    const user = await getUser();

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // -------------------------
    // CHECK MONTHLY LIMIT
    // -------------------------

    const usage = await checkUsageLimit(
      user.userId
    );

    if (!usage.allowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Monthly limit reached. Your ${usage.plan} plan allows ${usage.limit} requests per month.`,
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // -------------------------
    // GET REQUEST DATA
    // -------------------------

    const body = await request.json();

    const conversationId = Number(
      body.conversationId
    );

    const message = body.message?.trim();

    if (!conversationId || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Conversation and message are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // -------------------------
    // CHECK CONVERSATION OWNER
    // -------------------------

    const conversation = await pool.query(
      `SELECT id
       FROM conversations
       WHERE id = $1
       AND user_id = $2`,
      [
        conversationId,
        user.userId,
      ]
    );

    if (conversation.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Conversation not found",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // -------------------------
    // GET OLD MESSAGES
    // -------------------------

    const historyResult = await pool.query(
      `SELECT role, content
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [conversationId]
    );

    // -------------------------
    // SAVE USER MESSAGE
    // -------------------------

    await pool.query(
      `INSERT INTO messages
       (conversation_id, role, content)
       VALUES ($1, $2, $3)`,
      [
        conversationId,
        "user",
        message,
      ]
    );

    // -------------------------
    // CREATE AI HISTORY
    // -------------------------

    const history = historyResult.rows.map(
  (item: {
    role: string;
    content: string;
  }) => ({
    role: item.role as "user" | "assistant",
    content: item.content,
  })
);

    history.push({
      role: "user",
      content: message,
    });

    // -------------------------
    // GEMINI STREAM
    // -------------------------

    const aiStream =
      await generateAIStream(history);

    const encoder = new TextEncoder();

    const stream =
      new ReadableStream({
        async start(controller) {
          let fullResponse = "";

          try {
            for await (
              const chunk of aiStream
            ) {
              const text =
                chunk.text ?? "";

              if (!text) {
                continue;
              }

              fullResponse += text;

              controller.enqueue(
                encoder.encode(text)
              );
            }

            // -------------------------
            // SAVE AI RESPONSE
            // -------------------------

            if (fullResponse.trim()) {
              await pool.query(
                `INSERT INTO messages
                 (conversation_id, role, content)
                 VALUES ($1, $2, $3)`,
                [
                  conversationId,
                  "assistant",
                  fullResponse,
                ]
              );

              // -------------------------
              // LOG USAGE
              // -------------------------

              await logUsage(
                user.userId,
                "chat"
              );
            }

            controller.close();
          } catch (error) {
            console.error(
              "STREAM ERROR:",
              error
            );

            // Save partial response
            if (fullResponse.trim()) {
              try {
                await pool.query(
                  `INSERT INTO messages
                   (conversation_id, role, content)
                   VALUES ($1, $2, $3)`,
                  [
                    conversationId,
                    "assistant",
                    fullResponse,
                  ]
                );
              } catch (dbError) {
                console.error(
                  "FAILED TO SAVE PARTIAL RESPONSE:",
                  dbError
                );
              }
            }

            controller.enqueue(
              encoder.encode(
                "\n\nHZX AI temporarily stopped. Please try again."
              )
            );

            controller.close();
          }
        },
      });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type":
          "text/plain; charset=utf-8",

        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error(
      "CHAT API ERROR:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      }),
      {
        status: 500,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );
  }
}