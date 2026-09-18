 "use client";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Cart() {
  const [cart,setCart] = useState<any[]>([]);
  useEffect(()=>setCart(JSON.parse(localStorage.getItem("cart")||"[]")),[]);
  const total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  function update(i:number,d:number){ const c=[...cart]; c[i].qty=Math.max(1,c[i].qty+d); setCart(c); localStorage.setItem("cart",JSON.stringify(c)); window.dispatchEvent(new Event("cart-updated")); }
  return <><Header/><main className="container cart-page"><p className="eyebrow">YOUR BAG</p><h1>Shopping bag</h1>{cart.length===0?<div className="empty"><p>Your bag is empty.</p><Link href="/" className="btn dark">Continue shopping</Link></div>:<div className="cart-layout"><div>{cart.map((x,i)=><div className="cart-item" key={x.id}><img src={x.image}/><div><h3>{x.name}</h3><p>₹{x.price.toLocaleString("en-IN")}</p><div><button onClick={()=>update(i,-1)}>−</button> {x.qty} <button onClick={()=>update(i,1)}>+</button></div></div></div>)}</div><aside className="summary"><h2>Summary</h2><p>Subtotal <b>₹{total.toLocaleString("en-IN")}</b></p><p>Delivery <b>{total>=999?"FREE":"₹99"}</b></p><hr/><p className="grand">Total <b>₹{(total+(total>=999?0:99)).toLocaleString("en-IN")}</b></p><button className="btn dark" onClick={()=>alert("Demo checkout. Connect Razorpay/Stripe here.")}>Checkout</button></aside></div>}</main></>;
}
