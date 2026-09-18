 "use client";
import { useState } from "react";
import Link from "next/link";

export function AdminClient({initialProducts}:{initialProducts:any[]}) {
  const [products,setProducts]=useState(initialProducts);
  const [form,setForm]=useState<any>({name:"",brand:"Local Brand",category:"T-Shirts",gender:"Unisex",price:599,mrp:899,description:"",image:"https://placehold.co/800x1000/png?text=New+Product",colors:"#111111,#ffffff",sizes:"S,M,L,XL",stock:20});
  async function save(e:any){e.preventDefault(); const r=await fetch("/api/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)}); const p=await r.json(); setProducts([p,...products]); setForm({...form,name:""});}
  async function del(id:number){if(!confirm("Delete product?"))return; await fetch(`/api/products/${id}`,{method:"DELETE"}); setProducts(products.filter(p=>p.id!==id));}
  return <main className="admin"><div className="admin-head"><div><p className="eyebrow">SINGH READYMADE VASTRALAYA</p><h1>Catalogue Admin</h1></div><Link href="/" className="btn">View store</Link></div>
  <div className="admin-grid"><form className="admin-form" onSubmit={save}><h2>Add product</h2>{["name","brand","category","gender","price","mrp","image","colors","sizes","stock"].map(k=><input key={k} placeholder={k} value={form[k]} onChange={e=>setForm({...form,[k]:["price","mrp","stock"].includes(k)?Number(e.target.value):e.target.value})} required/>)}<textarea placeholder="description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><button className="btn dark">Add product</button></form>
  <section><h2>{products.length} products</h2><div className="admin-list">{products.map(p=><div className="admin-row" key={p.id}><img src={p.image}/><div><b>{p.name}</b><p>{p.brand} · ₹{p.price} · stock {p.stock}</p></div><button onClick={()=>del(p.id)}>Delete</button></div>)}</div></section></div></main>
}
