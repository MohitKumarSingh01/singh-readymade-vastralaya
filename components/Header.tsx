import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="topbar">
        Free delivery on orders above ₹999 · Call 7050189007
      </div>

      <div className="header-main container">
        {/* LOGO */}
        <Link href="/" className="brand-logo">
          <span>SINGH</span>
          <strong>READYMADE</strong>
          <small>VASTRALAYA</small>
        </Link>

        {/* NAVIGATION */}
        <nav
          className="main-nav"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/">Home</Link>

          <Link href="/?gender=Men">Men</Link>

          <Link href="/?gender=Women">Women</Link>

          <Link href="/?gender=Kids">Kids</Link>

          <Link href="/?category=Sarees">Sarees</Link>

          <Link href="/?category=Jeans">Jeans</Link>

          <Link href="/?category=T-Shirts">T-Shirts</Link>

          <Link href="/?category=Winter%20Wear">
            Winter Wear
          </Link>

          <Link href="/?category=Innerwear">
            Innerwear
          </Link>
        </nav>

        {/* ACTIONS */}
        <div
          className="header-actions"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginLeft: "auto",
          }}
        >
          <Link href="/admin" className="header-admin">
            Admin
          </Link>

          <Link href="/cart" className="header-cart">
            Bag (0)
          </Link>
        </div>
      </div>
    </header>
  );
}
