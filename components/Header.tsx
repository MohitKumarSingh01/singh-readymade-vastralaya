 "use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const sync = () => setCount(JSON.parse(localStorage.getItem("cart") || "[]").reduce((a:any,b:any)=>a+b.qty,0));
    sync(); window.addEventListener("cart-updated", sync);
    return () => window.removeEventListener("cart-updated", sync);
  }, []);
  return (
    <header className="header">
      <div className="topbar">Free delivery on orders above ₹999 · Call 7050189007</div>
      <nav className="nav container">
        <Link href="/" className="logo">SINGH <span>READYMADE</span><small>VASTRALAYA</small></Link>
        <div className="navlinks">
          <Link href="/?gender=Men">Men</Link><Link href="/?gender=Women">Women</Link>
          <Link href="/?gender=Kids">Kids</Link><Link href="/?category=Sarees">Sarees</Link>
          <Link href="/?category=Winter%20Wear">Winter</Link><Link href="/?category=Innerwear">Innerwear</Link>
        </div>
        <div className="navactions"><Link href="/admin">Admin</Link><Link href="/cart" className="cart">Bag ({count})</Link></div>
      </nav>
    </header>
  );
}
