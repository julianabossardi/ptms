import type { NextRequest } from "next/server";

type Outcome =
  | { status: "success"; content: { token: string; provider: "github" } }
  | { status: "error"; content: { message: string } };

// Retorno do GitHub: troca o code pelo token e entrega ao Decap via postMessage.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("decap_oauth_state")?.value;

  if (!code || !state || state !== expectedState) {
    return popup({ status: "error", content: { message: "Estado OAuth inválido." } });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${request.nextUrl.origin}/api/callback`,
    }),
  });
  const data = (await tokenResponse.json()) as {
    access_token?: string;
    error_description?: string;
  };

  if (!data.access_token) {
    return popup({
      status: "error",
      content: { message: data.error_description ?? "Falha ao obter token." },
    });
  }

  return popup({
    status: "success",
    content: { token: data.access_token, provider: "github" },
  });
}

// Protocolo do Decap: a janela avisa "authorizing", espera resposta da mesma
// origem e só então envia o resultado.
function popup({ status, content }: Outcome) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const html = `<!doctype html><html><body><script>
(function () {
  var message = ${JSON.stringify(message).replace(/</g, "\\u003c")};
  function receive(event) {
    if (event.origin !== window.location.origin) return;
    window.opener.postMessage(message, event.origin);
    window.removeEventListener("message", receive);
  }
  window.addEventListener("message", receive, false);
  window.opener.postMessage("authorizing:github", window.location.origin);
})();
</script></body></html>`;

  const response = new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  response.headers.append(
    "Set-Cookie",
    "decap_oauth_state=; Path=/api/callback; Max-Age=0",
  );
  return response;
}
