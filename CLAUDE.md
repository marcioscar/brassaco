# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral

Loja online da **Brassaco Embalagens (BEL)** — catálogo de produtos de embalagem, cadastro/login de clientes, criação de pedidos com checkout via Pagar.me e um painel administrativo. SPA com SSR construído com React Router 7 (framework mode), Prisma + MongoDB. O código (variáveis, funções, comentários, mensagens) é em **português**; mantenha esse padrão ao editar.

## Comandos

```bash
npm run dev            # servidor de desenvolvimento com HMR (http://localhost:5173)
npm run build          # build de produção (gera build/client e build/server)
npm start              # serve o build de produção
npm run typecheck      # react-router typegen + tsc — rode após mudar rotas ou tipos
npm run db:normalizar-produtos   # script único: converte campos codigo/grupo de string p/ int no Mongo
```

Não há suíte de testes nem linter configurados. `npm run typecheck` é a principal verificação — rode-o depois de alterar rotas (os tipos `./+types/*` são gerados) ou modelos de dados.

Prisma: o schema fica em `prisma/schema.prisma` (provider `mongodb`). Após editá-lo, rode `npx prisma generate`. As variáveis de ambiente do `.env` são carregadas pelo Prisma via `prisma.config.ts` (`import "dotenv/config"`).

## Arquitetura

**Camadas (server-only vs client).** Arquivos `*.server.ts` rodam apenas no servidor e nunca devem ser importados em código de cliente:
- `app/db.server.ts` — singleton do `PrismaClient` (reutilizado via `global.__db` em dev).
- `app/models/*.server.ts` — acesso a dados + validação/normalização. Toda lógica de banco passa por aqui (`clientes`, `pedidos`, `produtos`).
- `app/services/*.server.ts` — integrações externas e regras: `pagarme.server.ts` (checkout/payment links), `email.server.ts` (SMTP via nodemailer p/ recuperação de senha), `admin-auth.server.ts` (valida credenciais admin contra env vars).

**Rotas** declaradas em `app/routes.ts` (config-based, não file-based). Páginas (`home`, `catalogo`, `conta`, `admin`, `redefinir-senha`) são `.tsx`; endpoints de API (`api/cliente`, `api/pedido`, `api/produto`, `api/pagarme/webhook`) são `.ts` com `action`/`loader`.

**Padrão das APIs internas.** As rotas `api.*.ts` recebem JSON via POST e despacham por um campo `intent` (ex.: `"criar"`, `"listar"`, `"admin_login"`, `"admin_atualizar_status"`). Cada payload é validado por uma função `parsearPayload` antes de chamar os models; respostas usam o helper `respostaJson`. Ao adicionar uma operação, estenda o union de payloads, a validação e o switch de `action` — siga o estilo existente em `app/routes/api.pedido.ts`.

**Fluxo de pedido + pagamento.** `api.pedido.ts` (intent `criar`) opcionalmente cria um checkout na Pagar.me (`criarCheckoutPontualPagarme`, valores em **centavos**), persiste o pedido com os dados do link de pagamento e devolve `checkoutUrl`. O webhook `api.pagarme-webhook.ts` recebe eventos da Pagar.me, mapeia tipo de evento → status (`STATUS_PEDIDO` + `pagamentoStatus`) e atualiza o pedido localizado pelo `pagamentoLinkId` (id `pl_*`, extraído recursivamente do payload). Os estados do pedido são o enum `STATUS_PEDIDO` em `app/models/pedidos.server.ts` — fonte única; a lista no `admin.tsx` deve espelhá-lo.

**Autenticação.** Não há sessões/cookies de servidor. A identidade é mantida no cliente via `localStorage`: `bel:cliente-id:v1` (cliente logado) e `bel:admin-auth:v1` (credenciais admin). Cada requisição de cliente reenvia `clienteId`; cada requisição admin reenvia `email`/`senha`, revalidados no servidor por `validarCredenciaisAdmin` contra `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Senhas de cliente usam hash `scrypt` com salt (`salt:hash`) em `clientes.server.ts`.

**Catálogo / agrupamento de produtos.** `produtos.server.ts` tem a lógica não óbvia: produtos têm um `grupo` numérico (mapeado por `GRUPOS_POR_CODIGO`) e/ou `nomeGrupo` textual, que são consolidados em "cards" de exibição via `AGRUPAMENTO_CATEGORIAS`. A filtragem do catálogo (`listarProdutosCatalogo`) compõe `where` do Prisma a partir de grupo, busca, tipo, marca (fornecedor) e faixa de preço, com paginação.

## UI

- React 19 + Tailwind CSS v4 (`@tailwindcss/vite`, sem `tailwind.config`; tema em `app/app.css`).
- Componentes shadcn em `app/components/ui/` (estilo `base-nova`, base `@base-ui`/Radix). Use `cn()` de `~/lib/utils` para classes. Config em `components.json`.
- Alias de import: `~/*` → `app/*`.
- Ícones: `lucide-react`.

## Variáveis de ambiente (`.env`)

`DATABASE_URL` (MongoDB), `APP_URL`, SMTP (`SMTP_HOST/PORT/USER/PASS`, `EMAIL_FROM`), Pagar.me (`PAGARME_SECRET_KEY`, `PAGARME_BASE_URL` — padrão é produção; defina a URL `sdx-api` para sandbox), admin (`ADMIN_EMAIL`, `ADMIN_PASSWORD`).

**Autenticação do webhook Pagar.me:** o endpoint `api.pagarme-webhook.ts` valida cada chamada e **falha fechado** — rejeita se nenhum segredo estiver configurado. Use Basic Auth (`PAGARME_WEBHOOK_USER` + `PAGARME_WEBHOOK_PASSWORD`, padrão da Pagar.me v5) ou um header customizado (`PAGARME_WEBHOOK_TOKEN` → header `x-webhook-token`). Configure os mesmos valores no painel da Pagar.me.
