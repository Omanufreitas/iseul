# Iseul — Notas do projeto

> **Manutenção:** atualize este arquivo sempre que mexermos na loja, admin, infra ou integrações.  
> Coloque data no histórico e mova itens de “Pendente” para “Feito” quando concluir.

**Última atualização:** 19/08/2026

---

## Links

| O quê | URL |
|-------|-----|
| Loja (produção) | https://iseul-rose.vercel.app |
| Domínio (quando DNS propagar) | https://iseul.com.br |
| Admin | `/admin/login` |
| Vercel | [emanuel-os/iseul](https://vercel.com/emanuel-os/iseul) |
| Supabase | `lutmqjafpetfobxtvpld` (São Paulo) |
| GitHub | https://github.com/Omanufreitas/iseul |

---

## Feito

### Loja
- [x] Next.js 15 + TypeScript + Tailwind + Framer Motion
- [x] Catálogo K-Beauty (57 produtos no Supabase)
- [x] Home, produto, sacola, checkout
- [x] Responsivo (menu mobile, CTAs, grids)
- [x] Deploy na Vercel (`iseul-rose.vercel.app`)

### Supabase
- [x] Projeto criado (região São Paulo)
- [x] Migration `20260819120000_init.sql` (tabelas, RLS)
- [x] Migration `20260819130000_asaas.sql` (`asaas_payment_id`, `asaas_checkout_id`)
- [x] Seeds: produtos + admins
- [x] Env vars na Vercel (URL, anon, service_role, AUTH_SECRET)

### Admin
- [x] Login via Supabase (`admin_users`)
- [x] CRUD produtos, pedidos, config da loja
- [x] Dashboard com gráficos + seletor de período personalizado
- [x] Removidos textos “modo demo” da interface
- [x] **Usuários admin** (`/admin/usuarios`) — tabela moderna
- [x] Permissões:
  - **Proprietário** (`manu.oficial93@gmail.com`): vê Integrações + menu Usuários
  - **Admin** (`brendonlanen@gmail.com`): resto do painel, sem painel Integrações

### Pagamentos
- [x] Migrado de Mercado Pago → **Asaas** (PIX + cartão, checkout avulso)
- [x] Webhook: `/api/webhooks/asaas`
- [x] Chaves Asaas (mesma conta Zepfit) na Vercel

### Domínio
- [x] `iseul.com.br` e `www.iseul.com.br` adicionados no projeto Vercel

---

## Pendente

### Domínio (Registro.br)
- [ ] Aguardar fim da **transição DNS** no Registro.br (~até 2h após registro)
- [ ] **Configurar zona DNS** → adicionar:
  - Tipo **A**, nome vazio → `76.76.21.21`
  - Tipo **A**, nome `www` → `76.76.21.21`
- [ ] Confirmar domínio **Valid** na Vercel (Settings → Domains)
- [ ] Atualizar `NEXT_PUBLIC_APP_URL` → `https://iseul.com.br` (Vercel + `.env.local`)
- [ ] Redeploy após trocar a URL

### Asaas
- [ ] Cadastrar **webhook** no painel Asaas:
  - URL: `https://iseul.com.br/api/webhooks/asaas` (ou `.vercel.app` até o domínio propagar)
  - Token: mesmo `ASAAS_WEBHOOK_TOKEN` da Vercel
  - Eventos: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`
- [ ] Testar checkout real (pedido → pagamento → status “aprovado” no admin)

### Opcional / depois
- [ ] Commit + push das últimas mudanças (dashboard, Asaas, usuários, domínio)
- [ ] Rotacionar `service_role` Supabase (foi exposta em chat no setup)
- [ ] E-mail transacional (confirmação de pedido)
- [ ] Criar admin pela UI (hoje só via `npm run seed:admin`)
- [ ] Analytics / conversão no dashboard

---

## Contas admin

| Perfil | E-mail | Senha | Observação |
|--------|--------|-------|------------|
| Proprietário | `manu.oficial93@gmail.com` | `123456` | Vê integrações + usuários |
| Admin | `brendonlanen@gmail.com` | `123456` | Sem painel Integrações |

Proprietário definido por `OWNER_ADMIN_EMAIL` (Vercel + `.env.example`).

---

## Variáveis de ambiente (Vercel)

Configuradas: `AUTH_SECRET`, Supabase (3), Asaas (2), `OWNER_ADMIN_EMAIL`, `NEXT_PUBLIC_APP_URL`, demo admin, frete/PIX.

**Ajustar quando domínio estiver no ar:** `NEXT_PUBLIC_APP_URL=https://iseul.com.br`

---

## Comandos úteis

```bash
cd iseul
npm run dev
npm run seed:products
ADMIN_PASSWORD='...' ADMIN_NAME='...' npm run seed:admin
npm run vercel:deploy
npx vercel domains inspect iseul.com.br
```

---

## Histórico

### 19/08/2026
- Criado Supabase, migration, seeds, deploy Vercel
- Corrigido `AUTH_SECRET` vazio em produção
- Removidos textos “modo demo”
- Dashboard com gráficos e período personalizado
- Migração Mercado Pago → Asaas
- Admin usuários + permissões (Manu proprietário, Brendon admin)
- Domínio `iseul.com.br` na Vercel; DNS no Registro.br aguardando transição
- Criado este arquivo `NOTAS.md`
