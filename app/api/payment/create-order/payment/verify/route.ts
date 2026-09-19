import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
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
      console.error("RAZORPAY_KEY_SECRET is missing.");

      return NextResponse.json(
        {
          success: false,
          error: "Razorpay secret is not configured.",
        },
        { status: 500 }
      );
    }

    /*
     * STEP 1
     * Verify Razorpay payment signature.
     */
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const generatedBuffer = Buffer.from(generatedSignature, "utf8");
    const receivedBuffer = Buffer.from(razorpay_signature, "utf8");

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

    /*
     * STEP 2
     * Find our order.
     */
    const numericOrderId = Number(orderId);

    if (!Number.isInteger(numericOrderId) || numericOrderId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: {
        id: numericOrderId,
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

    /*
     * STEP 3
     * Make sure Razorpay order belongs to our order.
     */
    if (order.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Order verification failed.",
        },
        { status: 400 }
      );
    }

    /*
     * STEP 4
     * If webhook already marked the order as PAID,
     * don't process it again.
     */
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        message: "Payment already verified.",
      });
    }

    /*
     * STEP 5
     * Mark payment as PAID.
     */
    const updatedOrder = await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        paymentStatus: "PAID",
        orderStatus: "PROCESSING",
      },
    });

    /*
     * Email notification is intentionally NOT sent here.
     *
     * Razorpay webhook handles:
     * - order.paid
     * - payment confirmation
     * - email notification
     *
     * This prevents duplicate emails.
     */

    return NextResponse.json({
      success: true,
      orderNumber: updatedOrder.orderNumber,
      paymentStatus: updatedOrder.paymentStatus,
      orderStatus: updatedOrder.orderStatus,
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
