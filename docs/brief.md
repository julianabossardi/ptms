# Brief de construção — site Rachel Oliveira Vieira

Reconstrução de um site hoje no Framer para uma stack própria. O objetivo é
fidelidade visual à referência existente, com um CMS que permita à cliente
publicar portfólio e posts sem tocar em código.

---

## 1. Stack

- **Framework:** Next.js (App Router), TypeScript
- **Estilo:** Tailwind CSS
- **CMS:** Decap CMS (git-based, conteúdo em markdown no próprio repositório)
- **Auth do CMS:** GitHub como backend + OAuth provider configurado
- **Hospedagem:** Vercel
- **Animação:** apenas o necessário. Preferir CSS e um listener de scroll.
  Só usar biblioteca de animação se um efeito específico exigir.

---

## 2. Regras de estética — LEIA ANTES DE ESCREVER CSS

Esta seção tem prioridade sobre qualquer instинct de "melhorar" o design.
A referência é uma estética editorial de moda: crua, tipográfica, de alto
contraste. Não é uma landing page de SaaS.

### Proibido, a menos que explicitamente pedido

- **Glassmorphism.** Nenhum `backdrop-filter: blur()`. Nenhum painel
  translúcido com borda clara.
- **Glow e neon.** Nenhum `box-shadow` colorido usado como brilho. Nenhum
  `text-shadow` luminoso.
- **Gradientes decorativos.** Nenhum `radial-gradient` ou `linear-gradient`
  como fundo, overlay ou preenchimento de superfície. Fundos são cor sólida.
- **Partículas, brilhos, ruído.** Nenhum canvas de partículas, nenhum overlay
  de grão/noise em SVG, nenhuma blob animada, nenhum cursor customizado
  luminoso.
- **Transições suaves demais.** Nenhum `fadeInUp` global aplicado a todo
  elemento que entra na viewport. Nenhuma animação de entrada em cascata
  (stagger) que não exista na referência.
- **Cantos arredondados** em imagens e blocos. A referência usa cantos retos.
- **Sombras** para dar profundidade. A hierarquia vem de escala tipográfica,
  cor e espaço — não de elevação.

### Regras de movimento

- Transições existem **só** nos estados observados na referência: hover das
  linhas de lista, abrir/fechar do menu, e o parallax das imagens.
- Duração de estado de UI: **máximo 200ms**. Easing `ease-out` ou `linear`.
  Nada de spring, nada de 600ms.
- Preferir **corte seco** a crossfade.
- Respeitar `prefers-reduced-motion`: desligar parallax e reveals.

### Regra geral

Se um efeito não está descrito neste brief ou visível na referência, **não
adicione**. Na dúvida entre fazer algo mais elaborado ou mais cru, escolha o
mais cru.

---

## 3. Design tokens

### Cores (extraídas do site de referência)

```css
--black:      #000000;  /* fundo dominante */
--black-off:  #0f0e0e;  /* fundo alternativo, seções */
--black-deep: #09090b;
--white:      #ffffff;  /* tipografia sobre preto */
--pink:       #ff60c5;  /* cor de marca — nome, PTMS, acentos */
--gray:       #bababa;  /* texto secundário, estados inativos */
```

A paleta é **preto, rosa e branco**, com variações tonais dentro desses três.
**Não introduzir cor nova — em particular, nenhum vermelho de acento.** O
`#ff002f` presente no CSS da referência é resíduo do template e não deve ser
reproduzido.

### Tipografia

Duas famílias, com papéis separados:

- **Display: Oswald.** Títulos grandes, wordmarks ("Work", "Rachel"),
  headlines de post, nomes na lista de projetos.
- **Corpo: Inter.** Parágrafos, legendas, créditos, navegação, metadados.

Ambas são SIL Open Font License e estão no Google Fonts.

- Carregar via `next/font/google` — isso já auto-hospeda os arquivos e evita
  requisição a domínio externo. Não usar `<link>` para fonts.googleapis.com.
- `display: 'swap'` nas duas.
- Expor como variáveis CSS (`--font-display`, `--font-body`) e mapear em
  `fontFamily` no Tailwind, para que o papel de cada uma fique explícito no
  markup.
- Carregar só os pesos efetivamente usados.

Oswald é condensada: em tamanho display ela ocupa menos largura por caractere
que uma grotesca normal, o que permite corpo tipográfico muito grande sem
quebrar linha. Não aplicar `letter-spacing` negativo tentando "apertar" mais —
a condensação já está no desenho da fonte.

Escala: display gigante (o "Work" e o "Rachel" ocupam boa parte da largura da
viewport), contra corpo de texto pequeno em coluna estreita. O contraste
brutal entre esses dois extremos é a assinatura do layout — não amenizar.

---

## 4. Estrutura de páginas

Navegação: **Home · Work · About · PTMS · Contact**

Menu em overlay, acionado por botão. Deve ser **fixo em todas as páginas**
(ver seção 7 — hoje está quebrado).

### Home (`/`)

- Fundo preto.
- Três rótulos de texto ancorados no topo, em posições distintas:
  nome (em `--pink`), função, localização.
- Sobre isso, um **collage de miniaturas espalhadas** — ver seção 5.

### Work (`/projects`)

- Palavra "Work" em display gigante, branco sobre preto.
- Imagens de projeto flutuando por cima com parallax no scroll — ver seção 5.
- Abaixo, **lista-tabela** de projetos em três colunas:
  `título · cliente · período`.
- Hover numa linha: a linha vai a branco, **as outras vão a `--gray`**, e uma
  miniatura do projeto aparece próxima ao cursor.

### Projeto individual (`/projects/[slug]`)

Ordem vertical:
1. Título (display) + cliente + período
2. Imagem de capa (vertical, proporção retrato)
3. Descrição em PT e EN (ver decisão na seção 6)
4. Créditos — pares função/nome, em quantidade variável por projeto
5. Galeria de imagens verticais
6. Link para o próximo projeto no pé

### About (`/about`)

- "Rachel" em display gigante.
- Mosaico de imagens que se revela atrás do texto em blocos pixelados
  (efeito de menor prioridade — ver seção 8).
- Abaixo, bio em PT e EN.

### PTMS (`/ptms`) — o blog

- **Fundo `--pink`.** Esta é a única seção que inverte a paleta. É deliberado.
- Lista de posts: data à esquerda, título à direita (títulos contêm emoji).
- Hover: miniatura do post aparece, mesmo padrão da lista de Work.

### Post do PTMS (`/ptms/[slug]`)

- Fundo preto.
- Headline grande, frequentemente uma citação entre aspas.
- Data alinhada à direita, abaixo da headline.
- **Bloco de paleta de cor** — grade de swatches extraída das imagens do post
  (ver seção 5).
- Corpo: imagens com legenda embaixo (créditos, @handles), subtítulos com
  emoji, parágrafos em coluna estreita.

### Contact (`/contact`)

Página simples, conteúdo editável via CMS.

### Rodapé

Não existe hoje e precisa ser criado (ver seção 7). Manter mínimo:
links sociais + crédito. Sem newsletter, sem CTA.

---

## 5. Os efeitos — a parte crítica

### 5.1 Distribuição espalhada de imagens (Home e Work)

**Este é o efeito mais importante do site e o mais fácil de errar.**

O que faz funcionar na referência é que as posições foram colocadas à mão por
um designer. Posição aleatória gerada em runtime **parece bug, não design**.

**Abordagem obrigatória: as posições são dados, não aleatoriedade.**

Criar um array de slots de layout, escrito à mão no código, com ~14 slots por
página. Cada slot define:

```ts
type Slot = {
  x: number;          // % da largura da viewport
  y: number;          // % da altura da seção
  width: number;      // em vw — variar deliberadamente
  rotation: number;   // graus, entre -4 e 4
  z: number;          // ordem de sobreposição
  parallax: number;   // multiplicador de velocidade, 0.2 a 1.4
};
```

As imagens vindas do CMS preenchem os slots **na ordem**. Se houver mais
imagens que slots, volta ao slot 1. Assim a cliente troca as imagens e o
layout continua composto.

**Restrições que fazem a composição ler como intencional:**

- **Reservar a zona central** onde fica o texto/wordmark. Nenhum slot invade
  a área de respiro da tipografia.
- **Variar tamanho com propósito:** 2 a 3 imagens grandes como âncora,
  4 a 5 médias, o resto pequenas. Tamanho uniforme mata o efeito.
- **Rotação sutil e desigual:** nem todas em 0°, nem todas rotacionadas.
  Algumas retas, algumas levemente tortas.
- **Sobreposição é desejável**, mas controlada por `z`. Imagens se
  encavalando parcialmente é parte da estética de moodboard.
- **Equilíbrio assimétrico:** peso maior de um lado, contrabalançado por um
  elemento pequeno do lado oposto. Não simetria.

**Parallax:** no Work, cada slot tem velocidade própria. Mais lento lê como
mais ao fundo. Implementar com `transform: translate3d()` sobre o progresso de
scroll da seção. **Não** usar opacidade — as imagens não desaparecem, elas se
movem. O wordmark "Work" fica `position: sticky` enquanto as imagens passam.

**Nota para quem for iterar:** os números dos slots são a parte que precisa
ser ajustada a olho. Gerar uma primeira versão razoável e esperar duas ou três
rodadas de ajuste fino. Não tentar resolver por fórmula.

### 5.2 Hover com miniatura nas listas (Work e PTMS)

- Miniatura aparece perto do cursor, acompanha o movimento do mouse com leve
  atraso (lerp), sem efeito de mola exagerado.
- Linha ativa em branco; as inativas em `--gray`.
- Corte seco ou transição de no máximo 150ms.
- Em touch/mobile: desligar. A lista fica navegável por toque simples.

### 5.3 Bloco de paleta (posts do PTMS)

Extração **automática** das cores dominantes das imagens do post.

- Fazer a extração em **build time**, não no cliente — gerar os hexes e
  gravá-los junto ao conteúdo do post. Extrair no browser custa performance e
  dá resultado instável.
- Grade de swatches sem gap, cantos retos, ocupando largura total.
- Os tons resultantes tendem a ser terrosos e abafados (marrons, verdes,
  oliva), porque vêm das fotos. Isso é esperado e desejado — **não** corrigir,
  saturar ou harmonizar a paleta extraída.
- Se um post não tiver imagens, o bloco simplesmente não renderiza.

### 5.4 Mosaico pixelado (About)

Menor prioridade. Revelar a imagem em blocos quadrados grandes que diminuem
progressivamente, conforme o scroll. Implementar com CSS `image-rendering:
pixelated` sobre uma versão reduzida da imagem, ou canvas.
Se ficar caro, simplificar para um reveal em blocos sem a progressão.

---

## 6. Modelo de conteúdo (Decap)

Quatro destinos: duas coleções de conteúdo, um grupo de páginas editáveis, e
um arquivo global.

### Decisão já fechada: bilíngue

Campos **separados** para PT e EN (`descricao_pt`, `descricao_en`), não um
campo único com prefixo "(PT-BR)" como está hoje. A exibição continua
empilhando os dois blocos, como na referência — sem seletor de idioma por
enquanto, mas a separação deixa a porta aberta.

### `config.yml`

```yaml
backend:
  name: github
  repo: OWNER/REPO
  branch: main

media_folder: "public/uploads"
public_folder: "/uploads"

collections:
  - name: projects
    label: "Projetos"
    label_singular: "Projeto"
    folder: "content/projects"
    create: true
    slug: "{{slug}}"
    sortable_fields: [ordem, titulo]
    fields:
      - { name: titulo, label: "Título", widget: string }
      - { name: cliente, label: "Cliente", widget: string }
      - { name: periodo, label: "Período", widget: string,
          hint: "Texto livre — aceita '2025' ou '2025 - hoje'" }
      - { name: ordem, label: "Ordem de exibição", widget: number,
          value_type: int, hint: "Menor número aparece primeiro" }
      - { name: capa, label: "Imagem de capa", widget: image }
      - { name: descricao_pt, label: "Descrição (PT)", widget: markdown }
      - { name: descricao_en, label: "Descrição (EN)", widget: markdown,
          required: false }
      - name: creditos
        label: "Créditos"
        widget: list
        required: false
        fields:
          - { name: funcao, label: "Função", widget: string }
          - { name: nome, label: "Nome", widget: string }
      - name: galeria
        label: "Galeria"
        widget: list
        required: false
        field: { name: imagem, label: "Imagem", widget: image }

  - name: ptms
    label: "PTMS"
    label_singular: "Post"
    folder: "content/ptms"
    create: true
    slug: "{{slug}}"
    sortable_fields: [data, titulo]
    fields:
      - { name: titulo, label: "Título", widget: string,
          hint: "Pode conter emoji" }
      - { name: data, label: "Data", widget: datetime,
          date_format: "DD/MM/YYYY", time_format: false }
      - { name: thumb, label: "Miniatura (hover na listagem)", widget: image }
      - { name: corpo, label: "Conteúdo", widget: markdown }

  - name: paginas
    label: "Páginas"
    files:
      - name: home
        label: "Home"
        file: "content/pages/home.md"
        fields:
          - { name: nome, label: "Nome", widget: string }
          - { name: funcao, label: "Função", widget: string }
          - { name: local, label: "Localização", widget: string }
          - name: collage
            label: "Imagens do collage"
            widget: list
            field: { name: imagem, label: "Imagem", widget: image }

      - name: about
        label: "About"
        file: "content/pages/about.md"
        fields:
          - { name: texto_pt, label: "Bio (PT)", widget: markdown }
          - { name: texto_en, label: "Bio (EN)", widget: markdown,
              required: false }
          - name: imagens
            label: "Imagens do mosaico"
            widget: list
            field: { name: imagem, label: "Imagem", widget: image }

      - name: contact
        label: "Contact"
        file: "content/pages/contact.md"
        fields:
          - { name: titulo, label: "Título", widget: string }
          - { name: corpo, label: "Conteúdo", widget: markdown }
          - { name: email, label: "E-mail", widget: string }

  - name: config
    label: "Configurações"
    files:
      - name: global
        label: "Global"
        file: "content/config/global.md"
        fields:
          - name: redes
            label: "Redes sociais"
            widget: list
            fields:
              - { name: rotulo, label: "Rótulo", widget: string,
                  hint: "Ex: (IG)" }
              - { name: url, label: "URL", widget: string }
          - { name: og_image, label: "Imagem de compartilhamento",
              widget: image }
```

### Notas de modelagem

- `periodo` é **string, não date** — precisa aceitar "2025 - hoje".
- A galeria e o collage são listas de imagem simples. A cliente ordena
  arrastando; o código cuida da posição (seção 5.1).
- A paleta do PTMS **não é campo do CMS** — é derivada das imagens em build.
- Não existe coleção `archive`. A página foi cortada do escopo.

---

## 7. Correções conhecidas

Problemas na referência que **não devem ser reproduzidos**:

1. **Menu não fixo.** Hoje não persiste entre páginas. Deve ser fixo e
   presente em todas.
2. **Rodapé ausente.** Criar (ver seção 4).
3. **Componentes que não somem no scroll.** Alguns elementos ficam presos na
   viewport quando deveriam sair. Revisar o comportamento de sticky/fixed
   em cada seção.
4. **Links sociais apontam para o autor do template** —
   `x.com/flowbertgustave` e `instagram.com/flowbertdesign`. Trocar pelos da
   cliente. Ficam no arquivo global do CMS para ela mesma corrigir depois.
5. **Inconsistência "Stylish" / "Styling".** A Home diz uma coisa, o Archive
   dizia outra. A intenção provável é "Stylist". Como agora é campo de CMS,
   confirmar com a cliente e preencher uma vez.
6. **Badge "Made in Framer"** sai naturalmente ao trocar de hospedagem.

---

## 8. Ordem de construção

1. Setup: Next.js, Tailwind, tokens de cor, Oswald e Inter via `next/font`
2. Layout base: menu fixo em overlay, rodapé, navegação entre rotas
3. Decap CMS: `config.yml`, backend GitHub, OAuth — **validar login antes de
   seguir**
4. Coleção `projects` + página de projeto individual + lista de Work
   (sem o collage ainda)
5. Coleção `ptms` + listagem rosa + template de post
6. Páginas editáveis: Home (sem collage), About (sem mosaico), Contact
7. **Efeito de collage/parallax** (Home e Work) — seção 5.1. Reservar tempo
   para iteração visual
8. Hover com miniatura nas listas — seção 5.2
9. Extração automática de paleta nos posts — seção 5.3
10. Mosaico pixelado do About — seção 5.4. Primeiro candidato a simplificar
    se o prazo apertar

Validar cada etapa contra a referência antes de avançar. Não construir tudo e
revisar no fim.
