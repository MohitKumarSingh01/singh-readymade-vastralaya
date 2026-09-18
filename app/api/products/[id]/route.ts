import { prisma } from "@/lib/prisma";
export async function DELETE(_: Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params; await prisma.product.delete({where:{id:Number(id)}}); return Response.json({ok:true});
}
