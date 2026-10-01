require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    const result = await pool.query("SELECT NOW()");

    console.log("DATABASE CONNECTED ✅");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("DATABASE ERROR ❌");
    console.error(error.message);
  } finally {
    await pool.end();
  }
}

test();