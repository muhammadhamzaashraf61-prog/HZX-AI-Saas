const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const { Client } = require("pg");

// Load .env.local
dotenv.config({
  path: ".env.local",
});

async function createAdmin() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing from .env.local");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  const password = "admin1234";

  const hashedPassword = await bcrypt.hash(password, 10);

  await client.query(
    `INSERT INTO users
      (name, email, password, plan, is_admin)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email)
     DO UPDATE SET
       password = EXCLUDED.password,
       is_admin = TRUE,
       plan = 'pro'`,
    [
      "HZX Admin",
      "admin@gmail.com",
      hashedPassword,
      "pro",
      true,
    ]
  );

  console.log("Admin account created successfully.");
  console.log("Email: admin@gmail.com");
  console.log("Password: admin1234");

  await client.end();
}

createAdmin().catch((error) => {
  console.error("ADMIN CREATION ERROR:", error);
});