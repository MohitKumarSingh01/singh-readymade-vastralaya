import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerUserId } from "@/lib/customerAuth";

export async function POST(req: NextRequest) {
  try {
    const userId = getCustomerUserId(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login to save an address.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const address = String(body.address || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const pincode = String(body.pincode || "").trim();

    if (!address || !city || !state || !pincode) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Address, city, state and pincode are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 6-digit pincode.",
        },
        { status: 400 }
      );
    }

    const savedAddress = await prisma.address.create({
      data: {
        userId,
        address,
        city,
        state,
        pincode,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Address saved successfully.",
        address: savedAddress,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("SAVE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save address.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = getCustomerUserId(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const addressId = Number(
      searchParams.get("id")
    );

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid address ID.",
        },
        { status: 400 }
      );
    }

    const existingAddress =
      await prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
        },
      });

    if (!existingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Address not found.",
        },
        { status: 404 }
      );
    }

    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete address.",
      },
      { status: 500 }
    );
  }
}
