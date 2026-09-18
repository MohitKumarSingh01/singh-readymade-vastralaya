import { prisma } from "@/lib/prisma";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export default async function Home({ searchParams }: { searchParams: Promise<Record<string,string|undefined>> }) {
  const sp = await searchParams;
  const q = sp.q || "";
  const gender = sp.gender;
  const category = sp.category;
  const products = await prisma.product.findMany({
    where: {
      ...(gender ? { gender } : {}),
      ...(category ? { category } : {}),
      ...(q ? { OR: [{name:{contains:q}}, {brand:{contains:q}}, {category:{contains:q}}] } : {})
    },
    orderBy: { createdAt: "desc" }
  });
  return <><Header/>
    <main>
      <section className="hero container">
        <div><p className="eyebrow">SINGH READYMADE VASTRALAYA</p><h1>Every style.<br/><em>One wardrobe.</em></h1>
        <p className="hero-copy">Fashion for men, women and kids — from daily essentials to festive sarees and winter layers.</p>
        <Link href="#shop" className="btn dark">Shop collection</Link></div>
        <div className="hero-card"><span>NEW SEASON</span><strong>Dress your<br/>everyday.</strong><small>24 demo styles · ready to customize</small></div>
      </section>
      <section className="categories container">
        {["Men","Women","Kids","Sarees","Jeans","T-Shirts","Winter Wear","Innerwear"].map(x=><Link key={x} href={`/?${x==="Men"||x==="Women"||x==="Kids" ? "gender":"category"}=${encodeURIComponent(x)}`}>{x}</Link>)}
      </section>
      <section id="shop" className="shop container">
        <div className="section-head"><div><p className="eyebrow">THE COLLECTION</p><h2>{q ? `Search: ${q}` : category || gender || "All clothing"}</h2></div>
        <form><input name="q" placeholder="Search clothes, brands..." defaultValue={q}/><button>Search</button></form></div>
        <div className="grid">{products.map(p=><ProductCard key={p.id} p={p}/>)}</div>
      </section>
    </main>
    <footer><div className="container footer-grid"><div><div className="logo">SINGH <span>READYMADE</span><small>VASTRALAYA</small></div><p>Fashion for every family.</p></div><div><b>Contact</b><p>7050189007<br/>mohitkumarsingh7050@gnmail.com</p></div></div></footer>
  </>;
}
