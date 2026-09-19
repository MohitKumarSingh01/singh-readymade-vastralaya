import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCustomerUserId } from "@/lib/customerAuth";

type CartItem = {
  productId: number;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const items = body.items as CartItem[];

    const customerName = String(body.customerName || "").trim();
    const customerEmail = String(body.customerEmail || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const address = String(body.address || "").trim();
    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const pincode = String(body.pincode || "").trim();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
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
        {
          success: false,
          message: "Please fill all delivery details.",
        },
        { status: 400 }
      );
    }

    if (!/^[0-9]{10}$/.test(customerPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 10-digit phone number.",
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

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error("Razorpay environment variables are missing.");

      return NextResponse.json(
        {
          success: false,
          message: "Payment gateway configuration is missing.",
        },
        { status: 500 }
      );
    }

    // Get logged-in customer if available.
    // Guest checkout is also allowed.
    const userId = getCustomerUserId(req);

    // Clean and validate cart items.
    const cleanItems = items
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity),
      }))
      .filter(
        (item) =>
          Number.isInteger(item.productId) &&
          item.productId > 0 &&
          Number.isInteger(item.quantity) &&
          item.quantity > 0
      );

    if (cleanItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cart items.",
        },
        { status: 400 }
      );
    }

    // Fetch actual products from database.
    // Price is always taken from DB, not from frontend.
    const productIds = [...new Set(cleanItems.map((item) => item.productId))];

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more products are no longer available.",
        },
        { status: 400 }
      );
    }

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    // Validate stock and calculate subtotal from DB prices.
    let subtotal = 0;

    for (const item of cleanItems) {
      const product = productMap.get(item.productId);

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: "Product not found.",
          },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `${product.name} has only ${product.stock} item(s) in stock.`,
          },
          { status: 400 }
        );
      }

      subtotal += product.price * item.quantity;
    }

    subtotal = Number(subtotal.toFixed(2));

    // Keep this same as the checkout page.
    const deliveryCharge = subtotal >= 999 ? 0 : 49;

    const total = Number((subtotal + deliveryCharge).toFixed(2));

    if (total <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order amount.",
        },
        { status: 400 }
      );
    }

    // Generate our own order number.
    // This is also used as Razorpay receipt.
    const orderNumber = `SRV-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;

    const amountInPaise = Math.round(total * 100);

    /*
     * STEP 1:
     * Create Razorpay order.
     */
    const razorpayAuth = Buffer.from(
      `${keyId}:${keySecret}`
    ).toString("base64");

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${razorpayAuth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: orderNumber,
          notes: {
            orderNumber,
            customerName,
            customerEmail,
            customerPhone,
          },
        }),
      }
    );

    const razorpayData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      console.error("Razorpay order creation failed:", razorpayData);

      return NextResponse.json(
        {
          success: false,
          message:
            razorpayData?.error?.description ||
            "Unable to create Razorpay order.",
        },
        { status: 502 }
      );
    }

    /*
     * STEP 2:
     * Save order in our PostgreSQL database.
     */
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

        razorpayOrderId: razorpayData.id,

        paymentStatus: "PENDING",
        orderStatus: "PENDING",

        userId: userId || null,

        items: {
          create: cleanItems.map((item) => {
            const product = productMap.get(item.productId)!;

            return {
              productId: product.id,
              quantity: item.quantity,
              price: product.price,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    /*
     * STEP 3:
     * Send everything required by Razorpay checkout
     * back to the frontend.
     */
    return NextResponse.json({
      success: true,

      keyId,

      amount: amountInPaise,
      currency: "INR",

      razorpayOrderId: razorpayData.id,

      orderId: order.id,
      orderNumber: order.orderNumber,

      subtotal,
      deliveryCharge,
      total,

      userId: order.userId,
    });
  } catch (error) {
    console.error("Create order error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating your order.",
      },
      { status: 500 }
    );
  }
}
