import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";
import { createCustomerSession } from "@/lib/customerAuth";

const scryptAsync = promisify(crypto.scrypt);

async function verifyPassword(
  password: string,
  storedPassword: string
) {
  try {
    const [salt, storedHash] = storedPassword.split(":");

    if (!salt || !storedHash) {
      return false;
    }

    const derivedKey = (await scryptAsync(
      password,
      salt,
      64
    )) as Buffer;

    const storedHashBuffer = Buffer.from(
      storedHash,
      "hex"
    );

    if (derivedKey.length !== storedHashBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      derivedKey,
      storedHashBuffer
    );
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordValid = await verifyPassword(
      password,
      user.password
    );

    if (!passwordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

    createCustomerSession(response, user.id);

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while logging in.",
      },
      { status: 500 }
    );
  }
}
