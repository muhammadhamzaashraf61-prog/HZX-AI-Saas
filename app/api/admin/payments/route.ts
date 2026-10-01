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
    // Check admin_token cookie
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

    // Get all payment requests
    const result = await pool.query(`
      SELECT
        p.id,
        p.amount,
        p.method,
        p.transaction_id,
        p.status,
        p.created_at,
        u.id AS user_id,
        u.name,
        u.email
      FROM payment_requests p
      JOIN users u
        ON p.user_id = u.id
      ORDER BY
        CASE
          WHEN p.status = 'pending'
          THEN 0
          ELSE 1
        END,
        p.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      payments: result.rows,
    });
  } catch (error) {
    console.error(
      "ADMIN PAYMENTS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load payments",
      },
      { status: 500 }
    );
  }
}