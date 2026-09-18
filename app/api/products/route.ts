import { prisma } from "@/lib/prisma";
export async function POST(req: Request) {
  const b = await req.json();
  const slug = b.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"") + "-" + Date.now();
  const p = await prisma.product.create({data:{...b,slug,price:Number(b.price),mrp:Number(b.mrp),stock:Number(b.stock)}});
  return Response.json(p);
}
export async function GET() { return Response.json(await prisma.product.findMany({orderBy:{createdAt:"desc"}})); }
