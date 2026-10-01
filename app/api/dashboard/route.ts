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

    const userResult = await pool.query(
      `SELECT
        u.name,
        u.email,
        u.plan,
        u.is_admin
       FROM users u
       WHERE u.id = $1`,
      [user.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const dbUser = userResult.rows[0];

    const usageResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM usage_logs
       WHERE user_id = $1
       AND created_at >= date_trunc(
         'month',
         CURRENT_TIMESTAMP
       )`,
      [user.userId]
    );

    const used = usageResult.rows[0].total;

    // =========================
    // ADMIN
    // =========================

    if (dbUser.is_admin === true) {
      return NextResponse.json({
        success: true,

        user: {
          name: dbUser.name,
          email: dbUser.email,
          plan: "admin",
          isAdmin: true,
        },

        usage: {
          used,
          isUnlimited: true,
          limit: null,
          remaining: null,
          percentage: 0,
        },
      });
    }

    // =========================
    // NORMAL USER
    // =========================

    const planResult = await pool.query(
      `SELECT monthly_requests
       FROM plans
       WHERE name = $1`,
      [dbUser.plan || "free"]
    );

    const limit =
      planResult.rows.length > 0
        ? planResult.rows[0].monthly_requests
        : 50;

    const remaining = Math.max(
      limit - used,
      0
    );

    const percentage =
      limit > 0
        ? Math.min((used / limit) * 100, 100)
        : 0;

    return NextResponse.json({
      success: true,

      user: {
        name: dbUser.name,
        email: dbUser.email,
        plan: dbUser.plan || "free",
        isAdmin: false,
      },

      usage: {
        used,
        isUnlimited: false,
        limit,
        remaining,
        percentage,
      },
    });
  } catch (error) {
    console.error("DASHBOARD API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard",
      },
      { status: 500 }
    );
  }
}