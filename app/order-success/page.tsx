"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("order");

  return (
    <>
      <Header />

      <main
        style={{
          minHeight: "calc(100vh - 80px)",
          background: "#f8fafc",
          padding: "60px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "45px 30px",
              textAlign: "center",
              boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
            }}
          >
            {/* Success Icon */}
            <div
              style={{
                width: "75px",
                height: "75px",
                margin: "0 auto 25px",
                borderRadius: "50%",
                background: "#dcfce7",
                color: "#15803d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "38px",
                fontWeight: "700",
              }}
            >
              ✓
            </div>

            <h1
              style={{
                margin: "0 0 12px",
                fontSize: "32px",
                fontWeight: "700",
                color: "#111827",
              }}
            >
              Order Placed Successfully
            </h1>

            <p
              style={{
                margin: "0 auto 30px",
                maxWidth: "520px",
                fontSize: "16px",
                lineHeight: "1.7",
                color: "#6b7280",
              }}
            >
              Thank you for shopping with Singh Readymade Vastralaya.
              Your payment has been received and your order is being
              processed.
            </p>

            {/* Order Number */}
            {orderNumber ? (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "20px",
                  marginBottom: "25px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 7px",
                    fontSize: "13px",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: "600",
                  }}
                >
                  Order Number
                </p>

                <p
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "700",
                    color: "#111827",
                    wordBreak: "break-word",
                  }}
                >
                  {orderNumber}
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: "#fff7ed",
                  border: "1px solid #fed7aa",
                  borderRadius: "14px",
                  padding: "18px",
                  marginBottom: "25px",
                  color: "#9a3412",
                }}
              >
                Your order has been received successfully.
              </div>
            )}

            {/* Status */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "14px",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "6px",
                  }}
                >
                  Payment
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#15803d",
                  }}
                >
                  Successful
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "14px",
                  padding: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    marginBottom: "6px",
                  }}
                >
                  Order Status
                </div>

                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#111827",
                  }}
                >
                  Processing
                </div>
              </div>
            </div>

            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#6b7280",
                marginBottom: "30px",
              }}
            >
              We have received your order details. You will receive
              further updates as your order moves through processing
              and delivery.
            </p>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <Link
                href="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "13px 24px",
                  borderRadius: "10px",
                  background: "#111827",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "15px",
                }}
              >
                Continue Shopping
              </Link>

              <Link
                href="/account"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "13px 24px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  color: "#111827",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "15px",
                  border: "1px solid #d1d5db",
                }}
              >
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f8fafc",
            color: "#111827",
            fontSize: "16px",
          }}
        >
          Loading order confirmation...
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
