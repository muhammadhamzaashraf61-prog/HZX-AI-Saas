import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type TokenPayload = {
  userId: number;
  email: string;
};

function getJWTSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return secret;
}

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      getJWTSecret()
    ) as TokenPayload;

    if (
      !decoded.userId ||
      !decoded.email
    ) {
      return null;
    }

    return {
      userId: Number(decoded.userId),
      email: decoded.email,
    };
  } catch (error) {
    console.error("AUTH TOKEN ERROR:", error);

    return null;
  }
}