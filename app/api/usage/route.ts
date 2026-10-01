import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET() {
  try {
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

    const totalResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM usage_logs
       WHERE user_id = $1`,
      [user.userId]
    );

    const chatResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM usage_logs
       WHERE user_id = $1
       AND feature = 'chat'`,
      [user.userId]
    );

    const writerResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM usage_logs
       WHERE user_id = $1
       AND feature = 'writer'`,
      [user.userId]
    );

    const documentResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM usage_logs
       WHERE user_id = $1
       AND feature = 'documents'`,
      [user.userId]
    );

    const recentResult = await pool.query(
      `SELECT feature, created_at
       FROM usage_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [user.userId]
    );

    return NextResponse.json({
      success: true,

      usage: {
        total: totalResult.rows[0].total,
        chat: chatResult.rows[0].total,
        writer: writerResult.rows[0].total,
        documents: documentResult.rows[0].total,
      },

      recent: recentResult.rows,
    });
  } catch (error) {
    console.error("USAGE API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load usage",
      },
      { status: 500 }
    );
  }
}