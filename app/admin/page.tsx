import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { AdminClient } from "@/components/AdminClient";
import {
  COOKIE_NAME,
  isValidAdminSession,
} from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();

  const session = cookieStore.get(COOKIE_NAME)?.value;

  if (!isValidAdminSession(session)) {
    redirect("/admin/login");
  }

  const products = await prisma.product.findMany({
    orderBy: {
      id: "desc",
    },
  });

  return <AdminClient initialProducts={products} />;
}
