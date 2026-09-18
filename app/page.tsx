import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;

  const q = sp.q || "";
  const gender = sp.gender;
  const category = sp.category;

  const products = await prisma.product.findMany({
    where: {
      ...(gender ? { gender } : {}),
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              {
                name: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                brand: {
                  contains: q,
                  mode: "insensitive",
                },
              },
              {
                category: {
                  contains: q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <Header />

      <main>
        {/* HERO SECTION */}
        <section className="hero container">
          <div className="hero-content">
            <p className="eyebrow">
              SINGH READYMADE VASTRALAYA
            </p>

            <h1>
              Style for
              <br />
              <em>Every Generation.</em>
            </h1>

            <p className="hero-copy">
              Discover everyday fashion for men, women and kids —
              from premium shirts and denim to sarees, winter wear
              and comfortable essentials.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "28px",
              }}
            >
              <Link href="#shop" className="btn dark">
                Shop Collection
              </Link>

              <Link href="/?gender=Women" className="btn light">
                Explore Women
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <span>NEW COLLECTION</span>

            <strong>
              Dress
              <br />
              Your Everyday.
            </strong>

            <small>
              {products.length} styles available
            </small>
          </div>
        </section>

        {/* CATEGORY STRIP */}
        <section className="categories container">
          <Link href="/?gender=Men">
            <span>01</span>
            Men
          </Link>

          <Link href="/?gender=Women">
            <span>02</span>
            Women
          </Link>

          <Link href="/?gender=Kids">
            <span>03</span>
            Kids
          </Link>

          <Link href="/?category=Sarees">
            <span>04</span>
            Sarees
          </Link>

          <Link href="/?category=Jeans">
            <span>05</span>
            Denim
          </Link>

          <Link href="/?category=Winter%20Wear">
            <span>06</span>
            Winter
          </Link>

          <Link href="/?category=Innerwear">
            <span>07</span>
            Essentials
          </Link>
        </section>

        {/* SHOP SECTION */}
        <section id="shop" className="shop container">
          <div className="section-head">
            <div>
              <p className="eyebrow">
                {q
                  ? "SEARCH RESULTS"
                  : "OUR COLLECTION"}
              </p>

              <h2>
                {q
                  ? `Results for "${q}"`
                  : category || gender || "All Clothing"}
              </h2>
            </div>

            <form
              method="GET"
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <input
                name="q"
                placeholder="Search clothes, brands..."
                defaultValue={q}
              />

              <button type="submit">
                Search
              </button>
            </form>
          </div>

          {/* QUICK FILTERS */}
          {!q && !gender && !category && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "28px",
              }}
            >
              <Link
                href="/?gender=Men"
                className="filter-pill"
              >
                Men
              </Link>

              <Link
                href="/?gender=Women"
                className="filter-pill"
              >
                Women
              </Link>

              <Link
                href="/?gender=Kids"
                className="filter-pill"
              >
                Kids
              </Link>

              <Link
                href="/?category=Sarees"
                className="filter-pill"
              >
                Sarees
              </Link>

              <Link
                href="/?category=Jeans"
                className="filter-pill"
              >
                Jeans
              </Link>

              <Link
                href="/?category=T-Shirts"
                className="filter-pill"
              >
                T-Shirts
              </Link>

              <Link
                href="/?category=Winter%20Wear"
                className="filter-pill"
              >
                Winter Wear
              </Link>
            </div>
          )}

          {/* PRODUCTS */}
          <div className="grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                p={product}
              />
            ))}
          </div>

          {/* EMPTY STATE */}
          {products.length === 0 && (
            <div className="empty-state">
              <h3>No products found</h3>

              <p>
                We couldn't find anything matching your
                search.
              </p>

              <Link
                href="/"
                className="btn dark"
              >
                View All Products
              </Link>
            </div>
          )}
        </section>

        {/* BRAND MESSAGE */}
        <section
          className="container"
          style={{
            paddingTop: "80px",
            paddingBottom: "90px",
          }}
        >
          <div
            style={{
              background: "#0b1f3a",
              color: "#fff",
              padding: "55px",
              borderRadius: "4px",
              textAlign: "center",
            }}
          >
            <p
              className="eyebrow"
              style={{ color: "#c9a227" }}
            >
              SINGH READYMADE VASTRALAYA
            </p>

            <h2
              style={{
                fontSize: "clamp(32px, 5vw, 58px)",
                margin: "12px 0",
              }}
            >
              Fashion for Every Family.
            </h2>

            <p
              style={{
                maxWidth: "650px",
                margin: "0 auto 28px",
                opacity: 0.8,
                lineHeight: 1.7,
              }}
            >
              From everyday essentials to festive occasions,
              find clothing that fits your style, comfort and
              lifestyle.
            </p>

            <Link
              href="#shop"
              className="btn"
              style={{
                background: "#c9a227",
                color: "#0b1f3a",
              }}
            >
              Explore Collection
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer>
        <div className="container footer-grid">
          <div>
            <div className="logo">
              SINGH <span>READYMADE</span>
              <small>VASTRALAYA</small>
            </div>

            <p>
              Fashion for every family.
            </p>
          </div>

          <div>
            <b>Shop</b>

            <p>
              <Link href="/?gender=Men">
                Men
              </Link>
              <br />

              <Link href="/?gender=Women">
                Women
              </Link>
              <br />

              <Link href="/?gender=Kids">
                Kids
              </Link>
              <br />

              <Link href="/?category=Sarees">
                Sarees
              </Link>
            </p>
          </div>

          <div>
            <b>Contact</b>

            <p>
              7050189007
              <br />
              mohitkumarsingh7050@gnmail.com
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
