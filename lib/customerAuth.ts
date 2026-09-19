import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "singh_customer_session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days

function getSecret() {
  const secret = process.env.CUSTOMER_AUTH_SECRET;

  if (!secret) {
    throw new Error("CUSTOMER_AUTH_SECRET is missing.");
  }

  return secret;
}

function createSignature(payload: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function createCustomerSession(
  response: NextResponse,
  userId: number
) {
  const expiresAt =
    Math.floor(Date.now() / 1000) + SESSION_DURATION;

  const payload = `${userId}.${expiresAt}`;
  const signature = createSignature(payload);

  const token = `${Buffer.from(payload).toString(
    "base64url"
  )}.${signature}`;

  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });

  return response;
}

export function getCustomerUserId(
  request: NextRequest
): number | null {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return null;
    }

    const [encodedPayload, signature] = parts;

    const payload = Buffer.from(
      encodedPayload,
      "base64url"
    ).toString("utf8");

    const [userIdString, expiresAtString] =
      payload.split(".");

    const userId = Number(userIdString);
    const expiresAt = Number(expiresAtString);

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !Number.isFinite(expiresAt)
    ) {
      return null;
    }

    // Session expired
    if (Math.floor(Date.now() / 1000) > expiresAt) {
      return null;
    }

    const expectedSignature = createSignature(payload);

    const receivedBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {
      return null;
    }

    return userId;
  } catch (error) {
    console.error("CUSTOMER SESSION ERROR:", error);
    return null;
  }
}

export function clearCustomerSession(
  response: NextResponse
) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}
