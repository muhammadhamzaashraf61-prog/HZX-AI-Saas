import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import pool from "@/lib/db";

async function checkAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      id: number;
      email: string;
      role: string;
    };

    if (decoded.role !== "admin") {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin(req);

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.plan,
        u.is_admin,
        u.created_at,
        COUNT(ul.id)::int AS usage
      FROM users u
      LEFT JOIN usage_logs ul
        ON ul.user_id = u.id
        AND ul.created_at >= date_trunc(
          'month',
          CURRENT_TIMESTAMP
        )
      GROUP BY
        u.id,
        u.name,
        u.email,
        u.plan,
        u.is_admin,
        u.created_at
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load users",
      },
      { status: 500 }
    );
  }
}