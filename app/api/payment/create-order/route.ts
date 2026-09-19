import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCustomerUserId } from "@/lib/customerAuth";

function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `SRV-${timestamp}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const customerName = String(
      body.customerName || ""
    ).trim();

    const customerEmail = String(
      body.customerEmail || ""
    )
      .trim()
      .toLowerCase();

    const customerPhone = String(
      body.customerPhone || ""
    ).trim();

    const address = String(
      body.address || ""
    ).trim();

    const city = String(body.city || "").trim();

    const state = String(
      body.state || ""
    ).trim();

    const pincode = String(
      body.pincode || ""
    ).trim();

    const items = Array.isArray(body.items)
      ? body.items
      : [];

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
          message:
            "Customer and delivery details are required.",
        },
        { status: 400 }
      );
    }

    if (!items.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    if (!/^[0-9]{10}$/.test(customerPhone)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid 10-digit mobile number.",
        },
        { status: 400 }
      );
    }

    if (!/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid 6-digit pincode.",
        },
        { status: 400 }
      );
    }

    /*
     * If the customer is logged in,
     * attach the order to their account.
     *
     * Guest checkout will continue to work
     * because userId can remain null.
     */
    const userId = getCustomerUserId(req);

    /*
     * Fetch products from database instead of
     * trusting prices sent from the browser.
     */
    const productIds = items
      .map((item: any) => Number(item.productId))
      .filter(
        (id: number) =>
          Number.isInteger(id) && id > 0
      );

    if (!productIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid cart items.",
        },
        { status: 400 }
      );
    }

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
          message:
            "One or more products are no longer available.",
        },
        { status: 400 }
      );
    }

    let subtotal = 0;

    const orderItems = [];

    for (const item of items) {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);

      if (
        !Number.isInteger(productId) ||
        productId <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid product in cart.",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid product quantity.",
          },
          { status: 400 }
        );
      }

      const product = products.find(
        (p) => p.id === productId
      );

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message:
              "One or more products are no longer available.",
          },
          { status: 400 }
        );
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `${product.name} has only ${product.stock} item(s) in stock.`,
          },
          { status: 400 }
        );
      }

      const itemTotal =
        product.price * quantity;

      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity,
        price: product.price,
      });
    }

    /*
     * Current delivery rule:
     * Free delivery above ₹999.
     * Otherwise ₹49.
     */
    const deliveryCharge =
      subtotal >= 999 ? 0 : 49;

    const total =
      subtotal + deliveryCharge;

    const orderNumber =
      generateOrderNumber();

    /*
     * Create database order.
     *
     * userId is automatically saved when the
     * customer is logged in.
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

        paymentStatus: "PENDING",
        orderStatus: "PENDING",

        userId: userId || null,

        items: {
          create: orderItems,
        },
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
      message: "Order created successfully.",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        total: order.total,
        paymentStatus:
          order.paymentStatus,
        orderStatus:
          order.orderStatus,
        userId: order.userId,
        items: order.items,
      },
    });
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create order. Please try again.",
      },
      { status: 500 }
    );
  }
}
