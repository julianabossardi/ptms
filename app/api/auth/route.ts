import { NextResponse, type NextRequest } from "next/server";

// Início do OAuth do Decap CMS: redireciona para a autorização do GitHub.
export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return new Response("GITHUB_CLIENT_ID não configurado.", { status: 500 });
  }

  const state = crypto.randomUUID();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set(
    "redirect_uri",
    `${request.nextUrl.origin}/api/callback`,
  );
  authorize.searchParams.set(
    "scope",
    request.nextUrl.searchParams.get("scope") ?? "repo,user",
  );
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  response.cookies.set("decap_oauth_state", state, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/api/callback",
    maxAge: 600,
  });
  return response;
}
