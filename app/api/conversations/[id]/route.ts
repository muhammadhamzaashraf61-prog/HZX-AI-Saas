import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(
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

    const conversation = await pool.query(
      `SELECT id, title, created_at
       FROM conversations
       WHERE id = $1 AND user_id = $2`,
      [id, user.userId]
    );

    if (conversation.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Conversation not found" },
        { status: 404 }
      );
    }

    const messages = await pool.query(
      `SELECT id, role, content, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      conversation: conversation.rows[0],
      messages: messages.rows,
    });
  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const result = await pool.query(
      `DELETE FROM conversations
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Conversation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Conversation deleted",
    });
  } catch (error) {
    console.error("DELETE CONVERSATION ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}