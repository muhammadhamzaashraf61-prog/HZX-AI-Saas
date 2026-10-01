import pool from "@/lib/db";

export async function logUsage(
  userId: number,
  feature: "chat" | "writer" | "documents"
) {
  try {
    await pool.query(
      `INSERT INTO usage_logs
       (user_id, feature)
       VALUES ($1, $2)`,
      [userId, feature]
    );
  } catch (error) {
    console.error("USAGE LOG ERROR:", error);
  }
}