import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is missing.");

      return NextResponse.json(
        { error: "Webhook secret is not configured." },
        { status: 500 }
      );
    }

    // Read the raw request body for Razorpay signature verification
    const rawBody = await req.text();

    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      console.error("Razorpay webhook signature missing.");

      return NextResponse.json(
        { error: "Missing webhook signature." },
        { status: 400 }
      );
    }

    // Generate expected Razorpay webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    // Secure signature comparison
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(signature, "utf8");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      console.error("Invalid Razorpay webhook signature.");

      return NextResponse.json(
        { error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);

    console.log("RAZORPAY WEBHOOK EVENT:", event.event);

    // We only configured order.paid
    if (event.event !== "order.paid") {
      return NextResponse.json({
        success: true,
        message: "Event ignored.",
      });
    }

    const razorpayOrderId = event?.payload?.order?.entity?.id;
    const razorpayPaymentId = event?.payload?.payment?.entity?.id;

    if (!razorpayOrderId || !razorpayPaymentId) {
      console.error("Razorpay order/payment ID missing.");

      return NextResponse.json(
        { error: "Order or payment ID missing." },
        { status: 400 }
      );
    }

    // Find the local order
    const order = await prisma.order.findUnique({
      where: {
        razorpayOrderId,
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
      console.error("Local order not found:", razorpayOrderId);

      // Return 200 so Razorpay does not keep retrying
      return NextResponse.json({
        success: true,
        message: "Local order not found.",
      });
    }

    // Prevent duplicate webhook processing
    if (order.paymentStatus === "PAID") {
      console.log("Order already marked PAID:", order.orderNumber);

      return NextResponse.json({
        success: true,
        message: "Order already processed.",
      });
    }

    // Mark order as paid
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        razorpayPaymentId,
        paymentStatus: "PAID",
        orderStatus: "PROCESSING",
      },
    });

    console.log("ORDER MARKED PAID:", order.orderNumber);

    // Send confirmation email
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is missing.");

      return NextResponse.json({
        success: true,
        paymentUpdated: true,
        emailSent: false,
      });
    }

    const resend = new Resend(resendApiKey);

    const itemsHtml = order.items
      .map(
        (item) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #ddd;">
              ${item.product.name}
            </td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">
              ${item.quantity}
            </td>
            <td style="padding:8px;border-bottom:1px solid #ddd;">
              ₹${item.price}
            </td>
          </tr>
        `
      )
      .join("");

    const emailResult = await resend.emails.send({
      from: "Singh Readymade Vastralaya <onboarding@resend.dev>",
      to: ["mohitkumarsingh7050@gmail.com"],
      subject: `Payment Successful - Order ${order.orderNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;">

          <h2 style="color:#1f2937;">
            Payment Successful
          </h2>

          <p>
            A new order has been successfully paid.
          </p>

          <hr />

          <h3>Order Details</h3>

          <p>
            <strong>Order Number:</strong> ${order.orderNumber}<br />
            <strong>Customer:</strong> ${order.customerName}<br />
            <strong>Phone:</strong> ${order.customerPhone}<br />
            <strong>Email:</strong> ${order.customerEmail}
          </p>

          <h3>Delivery Address</h3>

          <p>
            ${order.address}<br />
            ${order.city}, ${order.state} - ${order.pincode}
          </p>

          <h3>Items</h3>

          <table
            style="
              width:100%;
              border-collapse:collapse;
              border:1px solid #ddd;
            "
          >
            <thead>
              <tr>
                <th style="padding:8px;border-bottom:1px solid #ddd;text-align:left;">
                  Product
                </th>
                <th style="padding:8px;border-bottom:1px solid #ddd;text-align:left;">
                  Qty
                </th>
                <th style="padding:8px;border-bottom:1px solid #ddd;text-align:left;">
                  Price
                </th>
              </tr>
            </thead>

            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <h3>
            Total: ₹${order.total}
          </h3>

          <p>
            <strong>Payment ID:</strong> ${razorpayPaymentId}
          </p>

          <hr />

          <p>
            Singh Readymade Vastralaya
          </p>

        </div>
      `,
    });

    if (emailResult.error) {
      console.error("RESEND EMAIL ERROR:", emailResult.error);

      return NextResponse.json({
        success: true,
        paymentUpdated: true,
        emailSent: false,
      });
    }

    console.log("RESEND EMAIL SUCCESS:", emailResult.data);

    return NextResponse.json({
      success: true,
      paymentUpdated: true,
      emailSent: true,
    });
  } catch (error) {
    console.error("RAZORPAY WEBHOOK ERROR:", error);

    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
