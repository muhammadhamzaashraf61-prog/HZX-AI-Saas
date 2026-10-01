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

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const client = await pool.connect();

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

    const { id } = await context.params;
    const paymentId = Number(id);

    if (!Number.isInteger(paymentId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment ID",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    if (
      status !== "approved" &&
      status !== "rejected"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Status must be approved or rejected",
        },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // Payment aur user dono find karo
    const paymentResult = await client.query(
      `
      SELECT
        p.id,
        p.user_id,
        p.status,
        p.amount,
        u.email,
        u.name
      FROM payment_requests p
      JOIN users u
        ON p.user_id = u.id
      WHERE p.id = $1
      FOR UPDATE
      `,
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message: "Payment request not found",
        },
        { status: 404 }
      );
    }

    const payment = paymentResult.rows[0];

    // Already processed payment dobara process na ho
    if (
      payment.status !== "pending"
    ) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          success: false,
          message:
            "This payment has already been processed",
        },
        { status: 400 }
      );
    }

    // Payment status update
    await client.query(
      `
      UPDATE payment_requests
      SET status = $1
      WHERE id = $2
      `,
      [status, paymentId]
    );

    // APPROVED hone par user ko Pro plan do
    if (status === "approved") {
      await client.query(
        `
        UPDATE users
        SET plan = 'pro'
        WHERE id = $1
        `,
        [payment.user_id]
      );
    }

    // REJECTED hone par user ka existing plan
    // change nahi hoga.

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message:
        status === "approved"
          ? "Payment approved and user upgraded to Pro"
          : "Payment rejected",
      payment: {
        id: payment.id,
        status,
        user_id: payment.user_id,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(
      "ADMIN PAYMENT UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update payment",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
