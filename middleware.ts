import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAdminPage = pathname.startsWith("/admin");

  const isProductMutation =
    pathname.startsWith("/api/products") &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);

  if (!isAdminPage && !isProductMutation) {
    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return new NextResponse("Admin authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Singh Readymade Vastralaya Admin"',
      },
    });
  }

  const encoded = authorization.split(" ")[1];

  let decoded = "";

  try {
    decoded = atob(encoded);
  } catch {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const separatorIndex = decoded.indexOf(":");

  if (separatorIndex === -1) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  const adminUsername =
    process.env.ADMIN_USERNAME || "admin";

  const adminPassword =
    process.env.ADMIN_PASSWORD;

  if (
    !adminPassword ||
    username !== adminUsername ||
    password !== adminPassword
  ) {
    return new NextResponse("Invalid admin credentials", {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Singh Readymade Vastralaya Admin"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/products/:path*",
  ],
};
