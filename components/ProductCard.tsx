import Link from "next/link";
import { AddToCart } from "./AddToCart";

export function ProductCard({ p }: { p: any }) {
  const discount = Math.round((1 - p.price / p.mrp) * 100);
  return <article className="product-card">
    <Link href={`/product/${p.slug}`}><div className="product-image"><img src={p.image} alt={p.name}/><span>{discount}% OFF</span></div></Link>
    <div className="product-info">
      <div className="muted">{p.brand} · {p.gender}</div>
      <Link href={`/product/${p.slug}`}><h3>{p.name}</h3></Link>
      <div><b>₹{p.price.toLocaleString("en-IN")}</b> <del>₹{p.mrp.toLocaleString("en-IN")}</del></div>
      <div className="muted">★ {p.rating} · {p.stock} left</div>
      <AddToCart product={p}/>
    </div>
  </article>
}
