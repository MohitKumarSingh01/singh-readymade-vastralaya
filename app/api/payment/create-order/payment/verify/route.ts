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

    const generatedBuffer = Buffer.from(
      generatedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    if (
      generatedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(
        generatedBuffer,
        receivedBuffer
      )
    ) {
      console.error("Razorpay payment signature mismatch.");

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
     * Validate local order ID.
     */
    const numericOrderId = Number(orderId);

    if (
      !Number.isInteger(numericOrderId) ||
      numericOrderId <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    /*
     * STEP 3
     * Find local order.
     */
    const order = await prisma.order.findUnique({
      where: {
        id: numericOrderId,
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
     * STEP 4
     * Make sure Razorpay order belongs
     * to our local order.
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
     * STEP 5
     * If webhook has already processed the payment,
     * simply return success.
     */
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        message: "Payment already confirmed.",
      });
    }

    /*
     * STEP 6
     * Save the Razorpay payment ID.
     *
     * IMPORTANT:
     * Do NOT mark the order PAID here.
     *
     * The Razorpay webhook is responsible for the
     * final PAID status and email notification.
     */
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      paymentStatus: "PENDING",
      orderStatus: order.orderStatus,
      message: "Payment signature verified successfully.",
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Unable to verify payment.",
      },
      { status: 500 }
    );
  }
}
