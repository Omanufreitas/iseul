# Iseul — Loja K-Beauty

Loja própria da operação Iseul (migrada da Shopee), com frontend e painel admin.

**Status do projeto, pendências e histórico:** ver [`NOTAS.md`](./NOTAS.md) (atualizar sempre que houver mudanças).

## Stack

- **Next.js 15** + TypeScript + Tailwind
- **Supabase** (produtos, pedidos, clientes, admin)
- **Asaas** (checkout PIX + cartão)

## Desenvolvimento local

```bash
cd iseul
cp .env.example .env.local
npm install
npm run dev
```

Configure `.env.local` com Supabase (URL, anon key, service role) e `AUTH_SECRET`. Sem Supabase, a loja usa o catálogo local em `data/products.seed.json`.

- **Loja:** http://localhost:3000
- **Admin:** http://localhost:3000/admin/login

## Supabase

1. Crie um projeto Supabase (ex.: `iseul`)
2. Rode a migration: `supabase/migrations/20260819120000_init.sql`
3. Preencha `.env.local` com URL, anon key e service role key
4. Seed dos produtos:

```bash
node scripts/seed-products.mjs
```

5. Crie o admin:

```bash
ADMIN_PASSWORD='sua-senha' node scripts/seed-admin.mjs
```

## Mercado Pago

Variáveis (igual aos outros projetos):

```
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=https://seu-dominio.com.br
```

Webhook: `https://seu-dominio.com.br/api/webhooks/mercadopago?source_news=webhooks`

## Estrutura

```
iseul/
├── data/products.seed.json    # 57 produtos (Shopee → Iseul)
├── supabase/migrations/       # Schema
├── scripts/                   # Seed produtos + admin
└── src/
    ├── app/                   # Loja + admin + API webhook
    ├── components/store/      # UI da loja (visual bredon_1.html)
    ├── components/admin/      # Painel admin
    ├── actions/               # Checkout + CRUD admin
    └── lib/                   # MP, Supabase, auth
```

## Admin

- Dashboard com KPIs
- CRUD de produtos (campos espelhando Shopee: nome, marca, categoria, preço, pitch, imagens, estoque)
- Lista de pedidos
- Configurações da loja (barra de anúncio, frete grátis, desconto PIX)
