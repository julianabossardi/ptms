# Rachel Oliveira Vieira

Site portfólio + blog (PTMS). Next.js (App Router), Tailwind CSS v4, Decap CMS,
hospedagem na Vercel. Brief e regras de estética em [docs/brief.md](docs/brief.md).

## Rodar localmente

```bash
npm install
npm run dev
```

Site em http://localhost:3000.

## Editar conteúdo sem login (local)

Com o `npm run dev` rodando, em outro terminal:

```bash
npx decap-server
```

Abra http://localhost:3000/admin. As alterações são gravadas direto nos
arquivos de `content/` e `public/uploads/`.

## Estrutura

```
app/                 rotas (Home, Work, About, PTMS, Contact) e OAuth do CMS
app/api/auth         início do login GitHub do Decap
app/api/callback     troca do code pelo token e retorno ao Decap
components/          Menu (overlay fixo) e Footer
content/             conteúdo editado pelo CMS (markdown com frontmatter)
lib/                 leitura de conteúdo e renderização de markdown
public/admin/        Decap CMS (index.html + config.yml)
public/uploads/      imagens enviadas pelo CMS
```

## Login do CMS em produção

1. Repositório: `julianabossardi/ptms` (`backend.repo` em
   `public/admin/config.yml`).
2. Criar um OAuth App em GitHub → Settings → Developer settings → OAuth Apps:
   - Homepage URL: `https://SEU-DOMINIO`
   - Authorization callback URL: `https://SEU-DOMINIO/api/callback`

   Sem domínio próprio, use o endereço `.vercel.app` do projeto. Quando o
   domínio definitivo existir, basta trocar as duas URLs no OAuth App.
3. Na Vercel, configurar `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`
   (ver `.env.example`).
4. A cliente precisa ter acesso de escrita ao repositório para publicar.
