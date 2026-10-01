import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import pool from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const body = await request.json();
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Message cannot be empty" },
        { status: 400 }
      );
    }

    const messageResult = await pool.query(
      `SELECT m.id, m.role, m.conversation_id
       FROM messages m
       JOIN conversations c
         ON c.id = m.conversation_id
       WHERE m.id = $1
         AND c.user_id = $2`,
      [id, user.userId]
    );

    if (messageResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    const message = messageResult.rows[0];

    if (message.role !== "user") {
      return NextResponse.json(
        { success: false, message: "Only user messages can be edited" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `UPDATE messages
       SET content = $1
       WHERE id = $2
       RETURNING id, role, content, created_at`,
      [content, id]
    );

    return NextResponse.json({
      success: true,
      message: result.rows[0],
    });
  } catch (error) {
    console.error("EDIT MESSAGE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to edit message" },
      { status: 500 }
    );
  }
}