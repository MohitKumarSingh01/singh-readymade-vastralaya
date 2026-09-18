import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const items = Array.isArray(body.items) ? body.items : [];

    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const address = String(body.address || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const pincode = String(body.pincode || "").trim();

    if (!items.length) {
      return NextResponse.json(
        { error: "Cart is empty." },
        { status: 400 }
      );
    }

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !address ||
      !city ||
      !state ||
      !pincode
    ) {
      return NextResponse.json(
        { error: "Please provide complete customer details." },
        { status: 400 }
      );
    }

    const productIds = items.map((item: any) =>
      Number(item.id)
    );

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products are unavailable." },
        { status: 400 }
      );
    }

    let subtotal = 0;

    const orderItems = items.map((item: any) => {
      const product = products.find(
        (p) => p.id === Number(item.id)
      );

      if (!product) {
        throw new Error("Product not found.");
      }

      const quantity = Math.max(
        1,
        Number(item.qty) || 1
      );

      if (product.stock < quantity) {
        throw new Error(
          `${product.name} does not have enough stock.`
        );
      }

      subtotal += product.price * quantity;

      return {
        productId: product.id,
        quantity,
        price: product.price,
      };
    });

    const deliveryCharge = subtotal >= 999 ? 0 : 99;
    const total = subtotal + deliveryCharge;

    const razorpayKeyId =
      process.env.RAZORPAY_KEY_ID;

    const razorpayKeySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        {
          error:
            "Razorpay keys are not configured on the server.",
        },
        { status: 500 }
      );
    }

    const orderNumber = `SRV-${Date.now()}`;

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            Buffer.from(
              `${razorpayKeyId}:${razorpayKeySecret}`
            ).toString("base64"),
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: orderNumber,
          notes: {
            customerName,
            customerPhone,
          },
        }),
      }
    );

    const razorpayOrder =
      await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error(
        "Razorpay order error:",
        razorpayOrder
      );

      return NextResponse.json(
        {
          error:
            razorpayOrder?.error?.description ||
            "Unable to create Razorpay order.",
        },
        { status: 500 }
      );
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        address,
        city,
        state,
        pincode,
        subtotal,
        deliveryCharge,
        total,
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: "PENDING",
        orderStatus: "PENDING",

        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      amount: Math.round(total * 100),
      currency: "INR",
      keyId: razorpayKeyId,
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create order.",
      },
      { status: 500 }
    );
  }
}
