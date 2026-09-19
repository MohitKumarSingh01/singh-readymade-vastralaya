import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing payment verification details.",
        },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay secret is not configured.",
        },
        { status: 500 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: Number(orderId),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Order verification failed.",
        },
        { status: 400 }
      );
    }

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "PAID",
        orderStatus: "PROCESSING",
      },
    });

    // Send order notification email
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);

        const itemsHtml = order.items
          .map(
            (item) => `
              <tr>
                <td style="padding:8px;border:1px solid #ddd;">
                  ${item.product.name}
                </td>
                <td style="padding:8px;border:1px solid #ddd;">
                  ${item.quantity}
                </td>
                <td style="padding:8px;border:1px solid #ddd;">
                  ₹${item.price.toFixed(2)}
                </td>
              </tr>
            `
          )
          .join("");

        await resend.emails.send({
          from: "Singh Readymade Vastralaya <onboarding@resend.dev>",
          to: ["mohitkumarsingh7050@gnmail.com"],
          subject: `New Order Received - ${order.orderNumber}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;">
              <h2 style="color:#111827;">
                New Order Received
              </h2>

              <p>
                A new order has been successfully placed on
                <strong>Singh Readymade Vastralaya</strong>.
              </p>

              <hr />

              <h3>Order Details</h3>

              <p>
                <strong>Order Number:</strong> ${order.orderNumber}<br />
                <strong>Payment Status:</strong> ${order.paymentStatus}<br />
                <strong>Order Status:</strong> ${order.orderStatus}<br />
                <strong>Order Total:</strong> ₹${order.total.toFixed(2)}
              </p>

              <h3>Customer Details</h3>

              <p>
                <strong>Name:</strong> ${order.customerName}<br />
                <strong>Phone:</strong> ${order.customerPhone}<br />
                <strong>Email:</strong> ${order.customerEmail}
              </p>

              <h3>Delivery Address</h3>

              <p>
                ${order.address}<br />
                ${order.city}, ${order.state} - ${order.pincode}
              </p>

              <h3>Products</h3>

              <table style="border-collapse:collapse;width:100%;">
                <thead>
                  <tr>
                    <th style="padding:8px;border:1px solid #ddd;text-align:left;">
                      Product
                    </th>
                    <th style="padding:8px;border:1px solid #ddd;text-align:left;">
                      Quantity
                    </th>
                    <th style="padding:8px;border:1px solid #ddd;text-align:left;">
                      Price
                    </th>
                  </tr>
                </thead>

                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <br />

              <p>
                <strong>Subtotal:</strong> ₹${order.subtotal.toFixed(2)}<br />
                <strong>Delivery:</strong> ₹${order.deliveryCharge.toFixed(2)}<br />
                <strong>Total:</strong> ₹${order.total.toFixed(2)}
              </p>

              <hr />

              <p style="color:#666;font-size:13px;">
                This is an automatic order notification from
                Singh Readymade Vastralaya.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Order email error:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      message: "Payment verified successfully.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}
