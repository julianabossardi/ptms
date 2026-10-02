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
   - Homepage URL: `https://racheloliveiravieira.com`
   - Authorization callback URL: `https://racheloliveiravieira.com/api/callback`

   O código não guarda o domínio: o admin e as rotas de login usam o endereço
   em que foram abertos. Quem decide onde o login funciona é só a Callback URL
   cadastrada no OAuth App (o GitHub guarda uma só). Em outro domínio, basta
   trocar as duas URLs.
3. Na Vercel, configurar `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`
   (ver `.env.example`).
4. A cliente precisa ter acesso de escrita ao repositório para publicar.

## Domínio e analytics

- O endereço público está em `lib/site.ts` (`https://racheloliveiravieira.com`),
  usado nos links de compartilhar e na imagem de preview.
- O Google Analytics (`G-MTM6LDTXVZ`) é carregado no layout só nos deploys de
  produção da Vercel; previews e `npm run dev` não contam visitas.
