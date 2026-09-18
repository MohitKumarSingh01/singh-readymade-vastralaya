import { prisma } from "@/lib/prisma";
import { AdminClient } from "@/components/AdminClient";

export default async function Admin() {
  const products = await prisma.product.findMany({orderBy:{id:"desc"}});
  return <AdminClient initialProducts={products}/>;
}
