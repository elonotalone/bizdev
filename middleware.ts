import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/oceanleo-auth/middleware";

// Keeps the OceanLeo SSO session fresh on every request and re-writes the
// .oceanleo.com-scoped auth cookies. No redirects: visitors browse freely;
// login is prompted only when an AI action needs it.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
