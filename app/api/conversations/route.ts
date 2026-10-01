import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT id, title, created_at
       FROM conversations
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.userId]
    );

    return NextResponse.json({
      success: true,
      conversations: result.rows,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to load conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title =
      body.title?.trim() || "New Conversation";

    const result = await pool.query(
      `INSERT INTO conversations (user_id, title)
       VALUES ($1, $2)
       RETURNING id, title, created_at`,
      [user.userId, title]
    );

    return NextResponse.json({
      success: true,
      conversation: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to create conversation" },
      { status: 500 }
    );
  }
}