import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

    const result = await pool.query(
      `SELECT
        id,
        name,
        email,
        plan,
        is_admin,
        created_at
       FROM users
       WHERE id = $1`,
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const dbUser = result.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        plan: dbUser.is_admin
          ? "admin"
          : dbUser.plan || "free",
        isAdmin: dbUser.is_admin,
        createdAt: dbUser.created_at,
      },
    });
  } catch (error) {
    console.error("PROFILE GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest
) {
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

    const body = await request.json();

    const name = body.name?.trim();
    const currentPassword =
      body.currentPassword?.trim();
    const newPassword =
      body.newPassword?.trim();

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message: "Name is required",
        },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "Name must be at least 2 characters",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT password
       FROM users
       WHERE id = $1`,
      [user.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const updates: string[] = ["name = $1"];
    const values: unknown[] = [name];

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Current password is required",
          },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message:
              "New password must be at least 6 characters",
          },
          { status: 400 }
        );
      }

      const passwordMatches =
        await bcrypt.compare(
          currentPassword,
          result.rows[0].password
        );

      if (!passwordMatches) {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is incorrect",
          },
          { status: 400 }
        );
      }

      const hashedPassword =
        await bcrypt.hash(newPassword, 10);

      updates.push(
        `password = $${values.length + 1}`
      );

      values.push(hashedPassword);
    }

    values.push(user.userId);

    await pool.query(
      `UPDATE users
       SET ${updates.join(", ")}
       WHERE id = $${values.length}`,
      values
    );

    return NextResponse.json({
      success: true,
      message: newPassword
        ? "Profile and password updated successfully"
        : "Profile updated successfully",
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
      },
      { status: 500 }
    );
  }
}
