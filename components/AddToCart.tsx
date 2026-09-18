 "use client";
import { useState } from "react";

export function AddToCart({ product }: { product: any }) {
  const [added, setAdded] = useState(false);
  function add() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const i = cart.findIndex((x:any) => x.id === product.id);
    if (i >= 0) cart[i].qty += 1; else cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    setAdded(true); setTimeout(() => setAdded(false), 1200);
  }
  return <button className="btn" onClick={add}>{added ? "Added ✓" : "Add to Bag"}</button>;
}
