import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getUser } from "@/lib/auth";

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
      `SELECT
        id,
        amount,
        method,
        transaction_id,
        status,
        created_at
       FROM payment_requests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.userId]
    );

    return NextResponse.json({
      payments: result.rows,
    });
  } catch (error) {
    console.error("PAYMENTS GET ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      amount,
      method,
      transactionId,
    } = body;

    if (!amount || !method || !transactionId) {
      return NextResponse.json(
        {
          message:
            "Amount, payment method and transaction ID are required",
        },
        { status: 400 }
      );
    }

    const existingPayment = await pool.query(
      `SELECT id
       FROM payment_requests
       WHERE transaction_id = $1`,
      [transactionId]
    );

    if (existingPayment.rows.length > 0) {
      return NextResponse.json(
        {
          message:
            "This transaction ID has already been submitted",
        },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO payment_requests
       (user_id, amount, method, transaction_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        user.userId,
        Number(amount),
        method,
        transactionId.trim(),
      ]
    );

    return NextResponse.json({
      success: true,
      message:
        "Payment request submitted successfully",
      payment: result.rows[0],
    });
  } catch (error) {
    console.error("PAYMENT POST ERROR:", error);

    return NextResponse.json(
      { message: "Failed to submit payment" },
      { status: 500 }
    );
  }
}