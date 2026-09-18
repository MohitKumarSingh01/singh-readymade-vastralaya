import { prisma } from "@/lib/prisma";
import { AdminClient } from "@/components/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await prisma.product.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return <AdminClient initialProducts={products} />;
}
