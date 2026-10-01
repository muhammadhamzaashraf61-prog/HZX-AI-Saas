import pool from "@/lib/db";

export async function checkUsageLimit(
  userId: number
) {
  const userResult = await pool.query(
    `SELECT
      plan,
      is_admin
     FROM users
     WHERE id = $1`,
    [userId]
  );

  if (userResult.rows.length === 0) {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      plan: "unknown",
      isAdmin: false,
    };
  }

  const user = userResult.rows[0];

  // Admin = unlimited
  if (user.is_admin === true) {
    return {
      allowed: true,
      used: 0,
      limit: null,
      plan: "admin",
      isAdmin: true,
    };
  }

  const planName = user.plan || "free";

  const planResult = await pool.query(
    `SELECT monthly_requests
     FROM plans
     WHERE name = $1`,
    [planName]
  );

  if (planResult.rows.length === 0) {
    return {
      allowed: false,
      used: 0,
      limit: 0,
      plan: planName,
      isAdmin: false,
    };
  }

  const limit =
    Number(
      planResult.rows[0].monthly_requests
    );

  const usageResult = await pool.query(
    `SELECT COUNT(*)::int AS total
     FROM usage_logs
     WHERE user_id = $1
     AND created_at >= date_trunc(
       'month',
       CURRENT_TIMESTAMP
     )`,
    [userId]
  );

  const used =
    Number(usageResult.rows[0].total);

  return {
    allowed: used < limit,
    used,
    limit,
    plan: planName,
    isAdmin: false,
  };
}