import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  COOKIE_NAME,
  isValidAdminSession,
} from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!isValidAdminSession(token)) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Admin orders error:", error);

    return NextResponse.json(
      {
        error: "Unable to load orders.",
      },
      {
        status: 500,
      }
    );
  }
}
