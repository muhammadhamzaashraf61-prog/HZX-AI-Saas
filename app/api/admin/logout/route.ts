import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Admin logged out",
  });

  response.cookies.set("admin_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}