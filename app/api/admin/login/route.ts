import { NextRequest, NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createAdminSession,
  verifyAdminCredentials,
} from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const username = String(body.username || "");
    const password = String(body.password || "");

    if (!verifyAdminCredentials(username, password)) {
      return NextResponse.json(
        {
          error: "Invalid username or password",
        },
        {
          status: 401,
        }
      );
    }

    const token = createAdminSession();

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request",
      },
      {
        status: 400,
      }
    );
  }
}
