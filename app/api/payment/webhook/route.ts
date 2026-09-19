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

    /*
     * IMPORTANT:
     * Razorpay webhook signature must be calculated
     * using the raw request body.
     */
    const rawBody = await req.text();

    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature." },
        { status: 400 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

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

    /*
     * We only need order.paid.
     */
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
        {
          error: "Order or payment ID missing.",
        },
        { status: 400 }
      );
    }

    /*
     * Find local order using Razorpay order ID.
     */
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
      console.error(
        "Local order not found:",
        razorpayOrderId
      );

      /*
       * Return 200 so Razorpay doesn't repeatedly retry
       * an event for an order that doesn't exist locally.
       */
      return NextResponse.json({
        success: true,
        message: "Local order not found.",
      });
    }

    /*
     * If the order is already PAID with the same payment ID,
     * this webhook has already been processed.
     */
    if (
      order.paymentStatus === "PAID" &&
      order.razorpayPaymentId === razorpayPaymentId
    ) {
      console.log(
        "Webhook already processed:",
        order.orderNumber
      );

      return NextResponse.json({
        success: true,
        paymentUpdated: false,
        emailSent: false,
        message: "Order already processed.",
      });
    }

    /*
     * If order was marked PAID by the verify API but the
     * payment ID is not stored, complete the payment details.
     */
    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        razorpayPaymentId: razorpayPaymentId,
        paymentStatus: "PAID",
        orderStatus: "PROCESSING",
      },
    });

    console.log(
      "ORDER MARKED PAID:",
      updatedOrder.orderNumber
    );

    /*
     * RESEND EMAIL
     */
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error("RESEND_API_KEY is missing.");

      return NextResponse.json({
        success: true,
        paymentUpdated: true,
        emailSent: false,
        orderNumber: updatedOrder.orderNumber,
      });
    }

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

    const emailResult = await resend.emails.send({
      from: "Singh Readymade Vastralaya <onboarding@resend.dev>",

      to: ["mohitkumarsingh7050@gmail.com"],

      subject: `Payment Successful - Order ${order.orderNumber}`,

      html: `
        <div
          style="
            font-family:Arial,sans-serif;
            max-width:700px;
            margin:auto;
            line-height:1.6;
          "
        >

          <h2 style="color:#111827;">
            Payment Successful
          </h2>

          <p>
            A new order has been successfully paid on
            <strong>Singh Readymade Vastralaya</strong>.
          </p>

          <hr />

          <h3>Order Details</h3>

          <p>
            <strong>Order Number:</strong>
            ${order.orderNumber}
            <br />

            <strong>Payment Status:</strong>
            PAID
            <br />

            <strong>Order Status:</strong>
            PROCESSING
            <br />

            <strong>Payment ID:</strong>
            ${razorpayPaymentId}
            <br />

            <strong>Total:</strong>
            ₹${order.total.toFixed(2)}
          </p>

          <h3>Customer Details</h3>

          <p>
            <strong>Name:</strong>
            ${order.customerName}
            <br />

            <strong>Phone:</strong>
            ${order.customerPhone}
            <br />

            <strong>Email:</strong>
            ${order.customerEmail}
          </p>

          <h3>Delivery Address</h3>

          <p>
            ${order.address}
            <br />

            ${order.city},
            ${order.state}
            -
            ${order.pincode}
          </p>

          <h3>Products</h3>

          <table
            style="
              border-collapse:collapse;
              width:100%;
            "
          >
            <thead>
              <tr>
                <th
                  style="
                    padding:8px;
                    border:1px solid #ddd;
                    text-align:left;
                  "
                >
                  Product
                </th>

                <th
                  style="
                    padding:8px;
                    border:1px solid #ddd;
                    text-align:left;
                  "
                >
                  Quantity
                </th>

                <th
                  style="
                    padding:8px;
                    border:1px solid #ddd;
                    text-align:left;
                  "
                >
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
            <strong>Subtotal:</strong>
            ₹${order.subtotal.toFixed(2)}
            <br />

            <strong>Delivery:</strong>
            ₹${order.deliveryCharge.toFixed(2)}
            <br />

            <strong>Total:</strong>
            ₹${order.total.toFixed(2)}
          </p>

          <hr />

          <p style="color:#666;font-size:13px;">
            This is an automatic payment notification from
            Singh Readymade Vastralaya.
          </p>

        </div>
      `,
    });

    if (emailResult.error) {
      console.error(
        "RESEND EMAIL ERROR:",
        emailResult.error
      );

      return NextResponse.json({
        success: true,
        paymentUpdated: true,
        emailSent: false,
        orderNumber: updatedOrder.orderNumber,
      });
    }

    console.log(
      "RESEND EMAIL SUCCESS:",
      emailResult.data
    );

    return NextResponse.json({
      success: true,
      paymentUpdated: true,
      emailSent: true,
      orderNumber: updatedOrder.orderNumber,
    });
  } catch (error) {
    console.error(
      "RAZORPAY WEBHOOK ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}
