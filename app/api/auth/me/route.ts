import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerUserId } from "@/lib/customerAuth";

export async function GET(req: NextRequest) {
  try {
    const userId = getCustomerUserId(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        addresses: {
          orderBy: {
            createdAt: "desc",
          },
        },
        orders: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
            subtotal: true,
            deliveryCharge: true,
            total: true,
            paymentStatus: true,
            orderStatus: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                quantity: true,
                price: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer account not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("CUSTOMER ME API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load customer account.",
      },
      { status: 500 }
    );
  }
}
