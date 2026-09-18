import Link from "next/link";

export default async function OrderSuccess({
  searchParams,
}: {
  searchParams: Promise<{
    order?: string;
  }>;
}) {
  const params = await searchParams;
  const orderNumber = params.order || "Confirmed";

  return (
    <main className="container empty">
      <div
        style={{
          maxWidth: "650px",
          margin: "80px auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "76px",
            height: "76px",
            margin: "0 auto 24px",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "rgba(34, 197, 94, 0.12)",
            color: "#16803c",
            fontSize: "36px",
            fontWeight: 700,
          }}
        >
          ✓
        </div>

        <p className="eyebrow">
          ORDER CONFIRMED
        </p>

        <h1>Thank you for your purchase!</h1>

        <p
          style={{
            marginTop: "16px",
            lineHeight: 1.7,
          }}
        >
          Your payment has been successfully
          verified and your order has been
          confirmed.
        </p>

        <div
          style={{
            margin: "28px auto",
            padding: "20px",
            maxWidth: "420px",
            border: "1px solid rgba(7, 26, 51, 0.12)",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.7)",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: "13px",
              opacity: 0.65,
              marginBottom: "6px",
            }}
          >
            ORDER NUMBER
          </span>

          <strong
            style={{
              fontSize: "22px",
            }}
          >
            {orderNumber}
          </strong>
        </div>

        <p
          style={{
            fontSize: "14px",
            opacity: 0.7,
          }}
        >
          Please keep your order number for
          future reference.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "28px",
          }}
        >
          <Link
            href="/"
            className="btn dark"
          >
            Continue Shopping
          </Link>

          <Link
            href="/cart"
            className="btn"
          >
            View Bag
          </Link>
        </div>
      </div>
    </main>
  );
}
