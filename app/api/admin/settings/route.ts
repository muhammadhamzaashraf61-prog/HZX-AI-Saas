import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
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

export async function PATCH(
  req: NextRequest
) {
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

    const body = await req.json();

    const { name, email, password } = body;

    if (!name && !email && !password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nothing to update",
        },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: unknown[] = [];

    let index = 1;

    // NAME
    if (name !== undefined) {
      const cleanName =
        String(name).trim();

      if (!cleanName) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Name cannot be empty",
          },
          { status: 400 }
        );
      }

      updates.push(
        `name = $${index}`
      );

      values.push(cleanName);

      index++;
    }

    // EMAIL
    if (email !== undefined) {
      const cleanEmail =
        String(email)
          .trim()
          .toLowerCase();

      if (!cleanEmail) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Email cannot be empty",
          },
          { status: 400 }
        );
      }

      const existing =
        await pool.query(
          `
          SELECT id
          FROM users
          WHERE email = $1
          AND id != $2
          `,
          [
            cleanEmail,
            admin.id,
          ]
        );

      if (
        existing.rows.length > 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This email is already in use",
          },
          { status: 409 }
        );
      }

      updates.push(
        `email = $${index}`
      );

      values.push(cleanEmail);

      index++;
    }

    // PASSWORD
    if (password !== undefined) {
      const cleanPassword =
        String(password);

      if (cleanPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Password must be at least 6 characters",
          },
          { status: 400 }
        );
      }

      const hashedPassword =
        await bcrypt.hash(
          cleanPassword,
          10
        );

      updates.push(
        `password = $${index}`
      );

      values.push(
        hashedPassword
      );

      index++;
    }

    values.push(admin.id);

    const result =
      await pool.query(
        `
        UPDATE users
        SET ${updates.join(", ")}
        WHERE id = $${index}
        AND is_admin = true
        RETURNING
          id,
          name,
          email,
          role,
          is_admin
        `,
        values
      );

    if (
      result.rows.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin account not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Settings updated successfully",
      admin: result.rows[0],
    });
  } catch (error) {
    console.error(
      "ADMIN SETTINGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update settings",
      },
      { status: 500 }
    );
  }
}
