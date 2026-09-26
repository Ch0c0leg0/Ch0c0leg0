import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/auth";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

// 1. Rafraîchit la session Supabase (comptes clients) sur chaque navigation.
// 2. Garde d'authentification des routes /admin (sauf connexion)
//    et de l'API d'upload d'images.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    // Rafraîchit le token si nécessaire (ne bloque jamais la navigation).
    try {
      await supabase.auth.getUser();
    } catch {
      // Session absente ou invalide : on continue en invité.
    }
  }

  const { pathname } = request.nextUrl;

  // Routes publiques (pas de garde admin).
  if (
    pathname === "/admin/login" ||
    pathname === "/admin/_next" ||
    pathname.startsWith("/admin/_next") ||
    (!pathname.startsWith("/admin") && !pathname.startsWith("/api/upload"))
  ) {
    return response;
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const valid = await verifyAdminSession(token);

  // API d'upload : répondre en JSON plutôt qu'en redirection
  if (pathname.startsWith("/api/upload")) {
    if (!valid) {
      return NextResponse.json(
        { error: "Non autorisé. Connectez-vous à l'administration." },
        { status: 401 }
      );
    }
    return response;
  }

  if (!valid) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}
