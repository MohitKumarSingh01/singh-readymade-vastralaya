import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { AddToCart } from "@/components/AddToCart";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const p = await prisma.product.findUnique({
    where: { slug },
  });

  if (!p) {
    return (
      <>
        <Header />
        <main className="container empty">
          <h1>Product not found</h1>
          <Link href="/">Back to shop</Link>
        </main>
      </>
    );
  }

  const colors = p.colors.split(",");
  const sizes = p.sizes.split(",");

  return (
    <>
      <Header />

      <main className="container detail">
        <div className="detail-image">
          <img src={p.image} alt={p.name} />
        </div>

        <div className="detail-copy">
          <p className="eyebrow">
            {p.brand} · {p.gender}
          </p>

          <h1>{p.name}</h1>

          <p className="rating">
            ★ {p.rating} · In stock: {p.stock}
          </p>

          <div className="price">
            ₹{p.price.toLocaleString("en-IN")}{" "}
            <del>₹{p.mrp.toLocaleString("en-IN")}</del>
          </div>

          <p>{p.description}</p>

          <h4>Color</h4>

          <div className="swatches">
            {colors.map((c) => (
              <span
                key={c}
                title={c}
                style={{ background: c }}
              />
            ))}
          </div>

          <h4>Size</h4>

          <div className="sizes">
            {sizes.map((s) => (
              <button key={s}>{s}</button>
            ))}
          </div>

          <AddToCart product={p} />

          <div className="feature-list">
            <span>✓ Quality checked</span>
            <span>✓ Easy returns</span>
            <span>✓ Secure checkout</span>
          </div>
        </div>
      </main>
    </>
  );
}
